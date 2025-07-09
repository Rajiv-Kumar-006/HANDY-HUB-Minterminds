
const Worker = require('../models/Worker');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');
const emailService = require('../services/emailService');

// @desc    Submit worker application
// @route   POST /api/workers/apply
// @access  Private
exports.applyAsWorker = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Check if user already has a worker application
    const existingWorker = await Worker.findOne({ user: req.user.id });
    if (existingWorker) {
      return res.status(400).json({
        success: false,
        message: 'Worker application already exists',
        applicationStatus: existingWorker.applicationStatus
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      services,
      experience,
      hourlyRate,
      availability,
      bio,
      hasConvictions,
      convictionDetails
    } = req.body;

    // Create worker application
    const workerData = {
      user: req.user.id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      services,
      experience,
      hourlyRate: parseFloat(hourlyRate),
      availability,
      bio: bio.trim(),
      backgroundCheck: {
        hasConvictions: hasConvictions || false,
        convictionDetails: hasConvictions ? convictionDetails : ''
      },
      applicationStatus: 'pending',
      submittedAt: new Date()
    };

    const worker = await Worker.create(workerData);

    // Populate worker with user data
    await worker.populate('user', 'name email');

    // Send application confirmation email
    try {
      await emailService.sendWorkerApplicationConfirmation(
        req.user.email,
        req.user.name
      );
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the application if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Worker application submitted successfully',
      worker: {
        id: worker._id,
        applicationStatus: worker.applicationStatus,
        submittedAt: worker.submittedAt,
        fullName: worker.fullName
      }
    });

  } catch (error) {
    console.error('Worker application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting application'
    });
  }
};

// @desc    Get worker application status
// @route   GET /api/workers/application-status
// @access  Private
exports.getApplicationStatus = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user.id })
      .select('applicationStatus submittedAt approvedAt rejectionReason');

    if (!worker) {
      return res.status(200).json({
        success: true,
        hasApplication: false,
        canApply: true
      });
    }

    res.status(200).json({
      success: true,
      hasApplication: true,
      canApply: false,
      application: {
        status: worker.applicationStatus,
        submittedAt: worker.submittedAt,
        approvedAt: worker.approvedAt,
        rejectionReason: worker.rejectionReason
      }
    });

  } catch (error) {
    console.error('Get application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching application status'
    });
  }
};

// @desc    Get worker profile
// @route   GET /api/workers/profile
// @access  Private (Worker only)
exports.getWorkerProfile = async (req, res) => {
  try {
    const worker = await Worker.findOne({ 
      user: req.user.id,
      applicationStatus: 'approved'
    }).populate('user', 'name email phone avatar');

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found or not approved'
      });
    }

    res.status(200).json({
      success: true,
      worker
    });

  } catch (error) {
    console.error('Get worker profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching worker profile'
    });
  }
};

// @desc    Update worker profile
// @route   PUT /api/workers/profile
// @access  Private (Worker only)
exports.updateWorkerProfile = async (req, res) => {
  try {
    const worker = await Worker.findOne({ 
      user: req.user.id,
      applicationStatus: 'approved'
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found or not approved'
      });
    }

    const {
      services,
      hourlyRate,
      availability,
      bio,
      isAvailable
    } = req.body;

    // Update worker fields
    if (services) worker.services = services;
    if (hourlyRate) worker.hourlyRate = parseFloat(hourlyRate);
    if (availability) worker.availability = availability;
    if (bio) worker.bio = bio.trim();
    if (typeof isAvailable === 'boolean') worker.isAvailable = isAvailable;

    await worker.save();
    await worker.populate('user', 'name email phone avatar');

    res.status(200).json({
      success: true,
      message: 'Worker profile updated successfully',
      worker
    });

  } catch (error) {
    console.error('Update worker profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating worker profile'
    });
  }
};

// @desc    Get worker dashboard stats
// @route   GET /api/workers/dashboard
// @access  Private (Worker only)
exports.getWorkerDashboard = async (req, res) => {
  try {
    const worker = await Worker.findOne({ 
      user: req.user.id,
      applicationStatus: 'approved'
    }).populate('user', 'name email phone avatar');

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found or not approved'
      });
    }

    // Get recent bookings
    const recentBookings = await Booking.find({ worker: worker._id })
      .populate('service', 'name')
      .populate('customer.user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate additional stats
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyBookings = await Booking.countDocuments({
      worker: worker._id,
      createdAt: { $gte: thisMonth }
    });

    const monthlyEarnings = await Booking.aggregate([
      {
        $match: {
          worker: worker._id,
          status: 'completed',
          createdAt: { $gte: thisMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.totalAmount' }
        }
      }
    ]);

    const stats = {
      ...worker.stats,
      monthlyBookings,
      monthlyEarnings: monthlyEarnings[0]?.total || 0,
      completionRate: worker.completionRate
    };

    res.status(200).json({
      success: true,
      worker,
      stats,
      recentBookings
    });

  } catch (error) {
    console.error('Get worker dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
};

// @desc    Get available workers for a service
// @route   GET /api/workers/available
// @access  Public
exports.getAvailableWorkers = async (req, res) => {
  try {
    const {
      service,
      date,
      time,
      latitude,
      longitude,
      radius = 25,
      page = 1,
      limit = 10
    } = req.query;

    let query = {
      applicationStatus: 'approved',
      isAvailable: true,
      isVerified: true
    };

    // Filter by service if provided
    if (service) {
      query.services = { $in: [service] };
    }

    // Build aggregation pipeline
    let pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $match: {
          'user.isActive': true
        }
      }
    ];

    // Add geospatial filtering if coordinates provided
    if (latitude && longitude) {
      pipeline.push({
        $addFields: {
          distance: {
            $multiply: [
              {
                $acos: {
                  $add: [
                    {
                      $multiply: [
                        { $sin: { $degreesToRadians: parseFloat(latitude) } },
                        { $sin: { $degreesToRadians: { $arrayElemAt: ['$user.location.coordinates', 1] } } }
                      ]
                    },
                    {
                      $multiply: [
                        { $cos: { $degreesToRadians: parseFloat(latitude) } },
                        { $cos: { $degreesToRadians: { $arrayElemAt: ['$user.location.coordinates', 1] } } },
                        { $cos: { $degreesToRadians: { $subtract: [parseFloat(longitude), { $arrayElemAt: ['$user.location.coordinates', 0] }] } } }
                      ]
                    }
                  ]
                }
              },
              6371 // Earth's radius in kilometers
            ]
          }
        }
      });

      pipeline.push({
        $match: {
          distance: { $lte: parseFloat(radius) }
        }
      });

      pipeline.push({
        $sort: { distance: 1, 'rating.average': -1 }
      });
    } else {
      pipeline.push({
        $sort: { 'rating.average': -1, 'stats.completedBookings': -1 }
      });
    }

    // Add pagination
    pipeline.push(
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    );

    const workers = await Worker.aggregate(pipeline);

    // Get total count for pagination
    const totalPipeline = pipeline.slice(0, -2); // Remove skip and limit
    totalPipeline.push({ $count: 'total' });
    const totalResult = await Worker.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      workers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get available workers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching workers'
    });
  }
};

// @desc    Get worker public profile
// @route   GET /api/workers/:id
// @access  Public
exports.getWorkerPublicProfile = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .populate('user', 'name avatar bio location')
      .select('-documents -backgroundCheck');

    if (!worker || worker.applicationStatus !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    // Get recent reviews
    const recentReviews = await Booking.find({
      worker: worker._id,
      'review.rating': { $exists: true }
    })
    .populate('customer.user', 'name')
    .select('review service')
    .populate('service', 'name')
    .sort({ 'review.reviewDate': -1 })
    .limit(5);

    res.status(200).json({
      success: true,
      worker,
      recentReviews
    });

  } catch (error) {
    console.error('Get worker public profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching worker profile'
    });
  }
};

// @desc    Reapply as worker (for rejected applications)
// @route   POST /api/workers/reapply
// @access  Private
exports.reapplyAsWorker = async (req, res) => {
  try {
    const existingWorker = await Worker.findOne({ user: req.user.id });
    
    if (!existingWorker) {
      return res.status(404).json({
        success: false,
        message: 'No previous application found'
      });
    }

    if (existingWorker.applicationStatus !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Can only reapply for rejected applications'
      });
    }

    // Update the existing application
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      services,
      experience,
      hourlyRate,
      availability,
      bio,
      hasConvictions,
      convictionDetails
    } = req.body;

    existingWorker.firstName = firstName.trim();
    existingWorker.lastName = lastName.trim();
    existingWorker.email = email.trim().toLowerCase();
    existingWorker.phone = phone.trim();
    existingWorker.address = address.trim();
    existingWorker.services = services;
    existingWorker.experience = experience;
    existingWorker.hourlyRate = parseFloat(hourlyRate);
    existingWorker.availability = availability;
    existingWorker.bio = bio.trim();
    existingWorker.backgroundCheck = {
      hasConvictions: hasConvictions || false,
      convictionDetails: hasConvictions ? convictionDetails : ''
    };
    existingWorker.applicationStatus = 'pending';
    existingWorker.submittedAt = new Date();
    existingWorker.rejectionReason = undefined;

    await existingWorker.save();

    res.status(200).json({
      success: true,
      message: 'Worker application resubmitted successfully',
      worker: {
        id: existingWorker._id,
        applicationStatus: existingWorker.applicationStatus,
        submittedAt: existingWorker.submittedAt
      }
    });

  } catch (error) {
    console.error('Reapply as worker error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resubmitting application'
    });
  }
};

module.exports = exports;












// const Worker = require('../models/Worker');
// const User = require('../models/User');
// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
// const cloudinary = require('../utils/cloudinary');

// // @desc    Submit worker application
// // @route   POST /api/workers/apply
// // @access  Private
// exports.submitWorkerApplication = catchAsync(async (req, res, next) => {
//   const {
//     firstName,
//     lastName,
//     email,
//     phone,
//     address,
//     services,
//     experience,
//     hourlyRate,
//     availability,
//     bio,
//     hasConvictions,
//     convictionDetails
//   } = req.body;

//   // Check if user already has a worker application
//   const existingWorker = await Worker.findOne({ user: req.user.id });
  
//   if (existingWorker) {
//     return next(new AppError('Worker application already exists', 400));
//   }

//   // Validate required fields
//   if (!firstName || !lastName || !email || !phone || !address) {
//     return next(new AppError('Please provide all required personal information', 400));
//   }

//   if (!services || services.length === 0) {
//     return next(new AppError('Please select at least one service', 400));
//   }

//   if (!availability || availability.length === 0) {
//     return next(new AppError('Please select your availability', 400));
//   }

//   if (!bio || bio.length < 50) {
//     return next(new AppError('Bio must be at least 50 characters long', 400));
//   }

//   if (!hourlyRate || hourlyRate < 10 || hourlyRate > 200) {
//     return next(new AppError('Hourly rate must be between $10 and $200', 400));
//   }

//   // Create worker application
//   const worker = await Worker.create({
//     user: req.user.id,
//     firstName,
//     lastName,
//     email,
//     phone,
//     address,
//     services,
//     experience,
//     hourlyRate: parseFloat(hourlyRate),
//     availability,
//     bio,
//     backgroundCheck: {
//       hasConvictions: hasConvictions || false,
//       convictionDetails: hasConvictions ? convictionDetails : '',
//       status: 'pending'
//     },
//     applicationStatus: 'incomplete'
//   });

//   res.status(201).json({
//     success: true,
//     message: 'Worker application created successfully',
//     data: worker
//   });
// });

// // @desc    Upload worker documents
// // @route   POST /api/workers/documents
// // @access  Private
// exports.uploadDocuments = catchAsync(async (req, res, next) => {
//   const worker = await Worker.findOne({ user: req.user.id });
  
//   if (!worker) {
//     return next(new AppError('Worker application not found', 404));
//   }

//   const { documentType } = req.body;
  
//   if (!req.file) {
//     return next(new AppError('Please upload a file', 400));
//   }

//   try {
//     // Upload to cloudinary
//     const result = await cloudinary.uploader.upload(req.file.buffer, {
//       folder: 'worker-documents',
//       resource_type: 'auto'
//     });

//     if (documentType === 'idDocument') {
//       worker.documents.idDocument = {
//         url: result.secure_url,
//         publicId: result.public_id,
//         originalName: req.file.originalname,
//         uploadedAt: new Date()
//       };
//     } else if (documentType === 'certification') {
//       worker.documents.certifications.push({
//         name: req.file.originalname.split('.')[0],
//         url: result.secure_url,
//         publicId: result.public_id,
//         originalName: req.file.originalname,
//         uploadedAt: new Date()
//       });
//     }

//     await worker.save();

//     res.status(200).json({
//       success: true,
//       message: 'Document uploaded successfully',
//       data: {
//         url: result.secure_url,
//         originalName: req.file.originalname
//       }
//     });
//   } catch (error) {
//     console.error('Document upload error:', error);
//     return next(new AppError('Failed to upload document', 500));
//   }
// });

// // @desc    Submit worker application for review
// // @route   PUT /api/workers/submit
// // @access  Private
// exports.submitForReview = catchAsync(async (req, res, next) => {
//   const worker = await Worker.findOne({ user: req.user.id });
  
//   if (!worker) {
//     return next(new AppError('Worker application not found', 404));
//   }

//   // Check if ID document is uploaded
//   if (!worker.documents.idDocument || !worker.documents.idDocument.url) {
//     return next(new AppError('ID document is required before submission', 400));
//   }

//   // Submit application
//   worker.applicationStatus = 'pending';
//   worker.submittedAt = new Date();
  
//   await worker.save();

//   res.status(200).json({
//     success: true,
//     message: 'Application submitted for review successfully',
//     data: worker
//   });
// });

// // @desc    Get worker application status
// // @route   GET /api/workers/me
// // @access  Private
// exports.getWorkerApplication = catchAsync(async (req, res, next) => {
//   const worker = await Worker.findOne({ user: req.user.id }).populate('user', 'name email');
  
//   if (!worker) {
//     return next(new AppError('Worker application not found', 404));
//   }

//   res.status(200).json({
//     success: true,
//     data: worker
//   });
// });

// // @desc    Update worker application
// // @route   PUT /api/workers/me
// // @access  Private
// exports.updateWorkerApplication = catchAsync(async (req, res, next) => {
//   const worker = await Worker.findOne({ user: req.user.id });
  
//   if (!worker) {
//     return next(new AppError('Worker application not found', 404));
//   }

//   // Don't allow updates if application is already submitted
//   if (worker.applicationStatus === 'approved') {
//     return next(new AppError('Cannot update approved application', 400));
//   }

//   const allowedUpdates = [
//     'firstName', 'lastName', 'email', 'phone', 'address',
//     'services', 'experience', 'hourlyRate', 'availability', 'bio'
//   ];

//   const updates = {};
//   Object.keys(req.body).forEach(key => {
//     if (allowedUpdates.includes(key)) {
//       updates[key] = req.body[key];
//     }
//   });

//   // Handle background check updates
//   if (req.body.hasConvictions !== undefined) {
//     updates['backgroundCheck.hasConvictions'] = req.body.hasConvictions;
//     updates['backgroundCheck.convictionDetails'] = req.body.hasConvictions ? req.body.convictionDetails : '';
//   }

//   const updatedWorker = await Worker.findOneAndUpdate(
//     { user: req.user.id },
//     updates,
//     { new: true, runValidators: true }
//   );

//   res.status(200).json({
//     success: true,
//     message: 'Worker application updated successfully',
//     data: updatedWorker
//   });
// });

// // @desc    Get all workers (Admin only)
// // @route   GET /api/workers
// // @access  Private/Admin
// exports.getAllWorkers = catchAsync(async (req, res, next) => {
//   const { status, page = 1, limit = 10, search } = req.query;

//   // Build query
//   let query = {};
  
//   if (status) {
//     query.applicationStatus = status;
//   }

//   if (search) {
//     query.$or = [
//       { firstName: { $regex: search, $options: 'i' } },
//       { lastName: { $regex: search, $options: 'i' } },
//       { email: { $regex: search, $options: 'i' } }
//     ];
//   }

//   const workers = await Worker.find(query)
//     .populate('user', 'name email')
//     .sort({ createdAt: -1 })
//     .limit(limit * 1)
//     .skip((page - 1) * limit);

//   const total = await Worker.countDocuments(query);

//   res.status(200).json({
//     success: true,
//     count: workers.length,
//     pagination: {
//       page: parseInt(page),
//       limit: parseInt(limit),
//       total,
//       pages: Math.ceil(total / limit)
//     },
//     data: workers
//   });
// });

// // @desc    Update worker application status (Admin only)
// // @route   PUT /api/workers/:id/status
// // @access  Private/Admin
// exports.updateWorkerStatus = catchAsync(async (req, res, next) => {
//   const { status, rejectionReason } = req.body;

//   if (!['approved', 'rejected'].includes(status)) {
//     return next(new AppError('Invalid status', 400));
//   }

//   const worker = await Worker.findById(req.params.id);
  
//   if (!worker) {
//     return next(new AppError('Worker not found', 404));
//   }

//   worker.applicationStatus = status;
  
//   if (status === 'approved') {
//     worker.approvedAt = new Date();
//     worker.approvedBy = req.user.id;
//     worker.isVerified = true;
    
//     // Update user role to worker
//     await User.findByIdAndUpdate(worker.user, { role: 'worker' });
//   } else if (status === 'rejected') {
//     worker.rejectionReason = rejectionReason;
//   }

//   await worker.save();

//   res.status(200).json({
//     success: true,
//     message: `Worker application ${status} successfully`,
//     data: worker
//   });
// });

// // @desc    Get worker by ID (Admin only)
// // @route   GET /api/workers/:id
// // @access  Private/Admin
// exports.getWorkerById = catchAsync(async (req, res, next) => {
//   const worker = await Worker.findById(req.params.id).populate('user', 'name email');
  
//   if (!worker) {
//     return next(new AppError('Worker not found', 404));
//   }

//   res.status(200).json({
//     success: true,
//     data: worker
//   });
// });