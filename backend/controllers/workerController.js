const Worker = require("../models/Worker");
const AppError = require("../utils/appError");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

// Configure Cloudinary (ensure environment variables are set)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload file to Cloudinary
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) {
          reject(new AppError("Failed to upload file to Cloudinary", 500));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            originalName: file.originalname,
          });
        }
      }
    );
    Readable.from(file.buffer).pipe(stream);
  });
};

// Submit new worker application
exports.submitApplication = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== "worker") {
      return next(new AppError("Only workers can submit applications", 403));
    }

    const existingApplication = await Worker.findOne({ user: user._id });
    if (existingApplication) {
      return next(new AppError("You have already submitted an application", 400));
    }

    const applicationData = {
      user: user._id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      services: req.body.services,
      experience: req.body.experience,
      hourlyRate: parseFloat(req.body.hourlyRate),
      availability: req.body.availability,
      bio: req.body.bio,
      backgroundCheck: {
        hasConvictions: req.body.hasConvictions || false,
        convictionDetails: req.body.convictionDetails || "",
      },
    };

    const worker = await Worker.create(applicationData);

    res.status(201).json({
      success: true,
      data: worker,
    });
  } catch (error) {
    next(error);
  }
};

// Upload documents
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError("No file uploaded", 400));
    }

    const user = req.user;
    const worker = await Worker.findOne({ user: user._id });
    if (!worker) {
      return next(new AppError("Worker application not found", 404));
    }

    const { documentType } = req.body;
    if (!["idDocument", "certification"].includes(documentType)) {
      return next(new AppError("Invalid document type", 400));
    }

    const uploadedFile = await uploadToCloudinary(req.file);

    if (documentType === "idDocument") {
      worker.documents.idDocument = {
        url: uploadedFile.url,
        publicId: uploadedFile.publicId,
        originalName: uploadedFile.originalName,
      };
    } else {
      worker.documents.certifications.push({
        name: uploadedFile.originalName.split(".")[0],
        url: uploadedFile.url,
        publicId: uploadedFile.publicId,
        originalName: uploadedFile.originalName,
      });
    }

    await worker.save();

    res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      data: {
        url: uploadedFile.url,
        originalName: uploadedFile.originalName,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Submit application for review
exports.submitForReview = async (req, res, next) => {
  try {
    const user = req.user;
    const worker = await Worker.findOne({ user: user._id });

    if (!worker) {
      return next(new AppError("Worker application not found", 404));
    }

    if (!worker.documents.idDocument) {
      return next(new AppError("ID document is required before submission", 400));
    }

    await worker.submitApplication();

    res.status(200).json({
      success: true,
      message: "Application submitted for review",
      data: worker,
    });
  } catch (error) {
    next(error);
  }
};

// Get current worker's application
exports.getMyApplication = async (req, res, next) => {
  try {
    const user = req.user;
    const worker = await Worker.findOne({ user: user._id }).populate("user", "name email role");

    if (!worker) {
      return next(new AppError("Worker application not found", 404));
    }

    res.status(200).json({
      success: true,
      data: worker,
    });
  } catch (error) {
    next(error);
  }
};

// Update worker application
exports.updateApplication = async (req, res, next) => {
  try {
    const user = req.user;
    const worker = await Worker.findOne({ user: user._id });

    if (!worker) {
      return next(new AppError("Worker application not found", 404));
    }

    if (worker.applicationStatus === "approved") {
      return next(new AppError("Cannot update approved application", 400));
    }

    const updatableFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "services",
      "experience",
      "hourlyRate",
      "availability",
      "bio",
      "backgroundCheck.hasConvictions",
      "backgroundCheck.convictionDetails",
    ];

    Object.keys(req.body).forEach((key) => {
      if (updatableFields.includes(key)) {
        if (key.includes(".")) {
          const [parent, child] = key.split(".");
          worker[parent][child] = req.body[key];
        } else {
          worker[key] = req.body[key];
        }
      }
    });

    if (req.body.hourlyRate) {
      worker.hourlyRate = parseFloat(req.body.hourlyRate);
    }

    await worker.save();

    res.status(200).json({
      success: true,
      message: "Application updated successfully",
      data: worker,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all worker applications
exports.getAllApplications = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) {
      query.applicationStatus = status;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const workers = await Worker.find(query)
      .populate("user", "name email")
      .select(
        "firstName lastName email services experience applicationStatus submittedAt"
      );

    res.status(200).json({
      success: true,
      count: workers.length,
      data: workers,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Approve worker application
exports.approveApplication = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return next(new AppError("Worker application not found", 404));
    }

    if (worker.applicationStatus !== "pending") {
      return next(new AppError("Only pending applications can be approved", 400));
    }

    worker.applicationStatus = "approved";
    worker.approvedAt = new Date();
    worker.approvedBy = req.user._id;
    worker.isVerified = true;

    await worker.save();

    // Update user role to worker
    const user = await User.findById(worker.user);
    if (user && user.role !== "worker") {
      user.role = "worker";
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Worker application approved",
      data: worker,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Reject worker application
exports.rejectApplication = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return next(new AppError("Worker application not found", 404));
    }

    if (worker.applicationStatus !== "pending") {
      return next(new AppError("Only pending applications can be rejected", 400));
    }

    worker.applicationStatus = "rejected";
    worker.rejectionReason = rejectionReason || "Application did not meet requirements";
    await worker.save();

    res.status(200).json({
      success: true,
      message: "Worker application rejected",
      data: worker,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete worker application
exports.deleteApplication = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return next(new AppError("Worker application not found", 404));
    }

    // Delete associated documents from Cloudinary
    if (worker.documents.idDocument?.publicId) {
      await cloudinary.uploader.destroy(worker.documents.idDocument.publicId);
    }
    for (const cert of worker.documents.certifications) {
      if (cert.publicId) {
        await cloudinary.uploader.destroy(cert.publicId);
      }
    }

    await worker.remove();

    res.status(204).json({
      success: true,
      message: "Worker application deleted",
    });
  } catch (error) {
    next(error);
  }
};


// const Worker = require("../models/Worker");
// const User = require("../models/User");
// const Booking = require("../models/Booking");
// const { validationResult } = require("express-validator");
// const emailService = require("../services/emailService");

// // @desc    Submit worker application
// // @route   POST /api/workers/apply
// // @access  Private
// exports.applyAsWorker = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       console.log("Validation errors:", errors.array()); // Debug log
//       return res.status(400).json({
//         success: false,
//         message: "Validation errors",
//         errors: errors.array(),
//       });
//     }

//     // Check if user already has a worker application
//     const existingWorker = await Worker.findOne({ user: req.user.id });
//     if (existingWorker) {
//       return res.status(400).json({
//         success: false,
//         message: "Worker application already exists",
//         applicationStatus: existingWorker.applicationStatus,
//       });
//     }

//     const {
//       firstName,
//       lastName,
//       email,
//       phone,
//       address,
//       services,
//       experience,
//       hourlyRate,
//       availability,
//       bio,
//       hasConvictions,
//       convictionDetails,
//     } = req.body;

//     // Parse JSON strings
//     const parsedServices =
//       typeof services === "string" ? JSON.parse(services) : services;
//     const parsedAvailability =
//       typeof availability === "string"
//         ? JSON.parse(availability)
//         : availability;

//     // Validate files
//     if (!req.files || !req.files.idDocument) {
//       return res.status(400).json({
//         success: false,
//         message: "Government ID is required",
//       });
//     }

//     // Create worker application
//     const workerData = {
//       user: req.user.id,
//       firstName: firstName.trim(),
//       lastName: lastName.trim(),
//       email: email.trim().toLowerCase(),
//       phone: phone.trim(),
//       address: address.trim(),
//       services: parsedServices,
//       experience,
//       hourlyRate: parseFloat(hourlyRate),
//       availability: parsedAvailability,
//       bio: bio.trim(),
//       backgroundCheck: {
//         hasConvictions: hasConvictions === "true" || hasConvictions === true,
//         convictionDetails:
//           hasConvictions === "true" || hasConvictions === true
//             ? convictionDetails
//             : "",
//       },
//       documents: {
//         idDocument: {
//           data: req.files.idDocument[0].buffer,
//           contentType: req.files.idDocument[0].mimetype,
//           filename: req.files.idDocument[0].originalname,
//         },
//         certifications: req.files.certifications
//           ? req.files.certifications.map((file) => ({
//               data: file.buffer,
//               contentType: file.mimetype,
//               filename: file.originalname,
//             }))
//           : [],
//       },
//       applicationStatus: "pending",
//       submittedAt: new Date(),
//     };

//     const worker = await Worker.create(workerData);

//     // Populate worker with user data
//     await worker.populate("user", "name email");

//     // Send application confirmation email
//     try {
//       await emailService.sendWorkerApplicationConfirmation(
//         req.user.email,
//         req.user.name
//       );
//     } catch (emailError) {
//       console.error("Failed to send confirmation email:", emailError);
//     }

//     res.status(201).json({
//       success: true,
//       message: "Worker application submitted successfully",
//       worker: {
//         id: worker._id,
//         applicationStatus: worker.applicationStatus,
//         submittedAt: worker.submittedAt,
//         fullName: worker.fullName,
//       },
//     });
//   } catch (error) {
//     console.error("Worker application error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while submitting application",
//       error: error.message,
//     });
//   }
// };

// // @desc    Get worker application status
// // @route   GET /api/workers/application-status
// // @access  Private
// exports.getApplicationStatus = async (req, res) => {
//   try {
//     const worker = await Worker.findOne({ user: req.user.id }).select(
//       "applicationStatus submittedAt approvedAt rejectionReason"
//     );

//     if (!worker) {
//       return res.status(200).json({
//         success: true,
//         hasApplication: false,
//         canApply: true,
//       });
//     }

//     res.status(200).json({
//       success: true,
//       hasApplication: true,
//       canApply: false,
//       application: {
//         status: worker.applicationStatus,
//         submittedAt: worker.submittedAt,
//         approvedAt: worker.approvedAt,
//         rejectionReason: worker.rejectionReason,
//       },
//     });
//   } catch (error) {
//     console.error("Get application status error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching application status",
//     });
//   }
// };

// // @desc    Get worker profile
// // @route   GET /api/workers/profile
// // @access  Private (Worker only)
// exports.getWorkerProfile = async (req, res) => {
//   try {
//     const worker = await Worker.findOne({
//       user: req.user.id,
//       applicationStatus: "approved",
//     }).populate("user", "name email phone avatar");

//     if (!worker) {
//       return res.status(404).json({
//         success: false,
//         message: "Worker profile not found or not approved",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       worker,
//     });
//   } catch (error) {
//     console.error("Get worker profile error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching worker profile",
//     });
//   }
// };

// // @desc    Update worker profile
// // @route   PUT /api/workers/profile
// // @access  Private (Worker only)
// exports.updateWorkerProfile = async (req, res) => {
//   try {
//     const worker = await Worker.findOne({
//       user: req.user.id,
//       applicationStatus: "approved",
//     });

//     if (!worker) {
//       return res.status(404).json({
//         success: false,
//         message: "Worker profile not found or not approved",
//       });
//     }

//     const { services, hourlyRate, availability, bio, isAvailable } = req.body;

//     // Update worker fields
//     if (services) worker.services = services;
//     if (hourlyRate) worker.hourlyRate = parseFloat(hourlyRate);
//     if (availability) worker.availability = availability;
//     if (bio) worker.bio = bio.trim();
//     if (typeof isAvailable === "boolean") worker.isAvailable = isAvailable;

//     await worker.save();
//     await worker.populate("user", "name email phone avatar");

//     res.status(200).json({
//       success: true,
//       message: "Worker profile updated successfully",
//       worker,
//     });
//   } catch (error) {
//     console.error("Update worker profile error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while updating worker profile",
//     });
//   }
// };

// // @desc    Get worker dashboard stats
// // @route   GET /api/workers/dashboard
// // @access  Private (Worker only)
// exports.getWorkerDashboard = async (req, res) => {
//   try {
//     const worker = await Worker.findOne({
//       user: req.user.id,
//       applicationStatus: "approved",
//     }).populate("user", "name email phone avatar");

//     if (!worker) {
//       return res.status(404).json({
//         success: false,
//         message: "Worker profile not found or not approved",
//       });
//     }

//     // Get recent bookings
//     const recentBookings = await Booking.find({ worker: worker._id })
//       .populate("service", "name")
//       .populate("customer.user", "name email phone")
//       .sort({ createdAt: -1 })
//       .limit(10);

//     // Calculate additional stats
//     const thisMonth = new Date();
//     thisMonth.setDate(1);
//     thisMonth.setHours(0, 0, 0, 0);

//     const monthlyBookings = await Booking.countDocuments({
//       worker: worker._id,
//       createdAt: { $gte: thisMonth },
//     });

//     const monthlyEarnings = await Booking.aggregate([
//       {
//         $match: {
//           worker: worker._id,
//           status: "completed",
//           createdAt: { $gte: thisMonth },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: "$pricing.totalAmount" },
//         },
//       },
//     ]);

//     const stats = {
//       ...worker.stats,
//       monthlyBookings,
//       monthlyEarnings: monthlyEarnings[0]?.total || 0,
//       completionRate: worker.completionRate,
//     };

//     res.status(200).json({
//       success: true,
//       worker,
//       stats,
//       recentBookings,
//     });
//   } catch (error) {
//     console.error("Get worker dashboard error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching dashboard data",
//     });
//   }
// };

// // @desc    Get available workers for a service
// // @route   GET /api/workers/available
// // @access  Public
// exports.getAvailableWorkers = async (req, res) => {
//   try {
//     const {
//       service,
//       date,
//       time,
//       latitude,
//       longitude,
//       radius = 25,
//       page = 1,
//       limit = 10,
//     } = req.query;

//     let query = {
//       applicationStatus: "approved",
//       isAvailable: true,
//       isVerified: true,
//     };

//     // Filter by service if provided
//     if (service) {
//       query.services = { $in: [service] };
//     }

//     // Build aggregation pipeline
//     let pipeline = [
//       { $match: query },
//       {
//         $lookup: {
//           from: "users",
//           localField: "user",
//           foreignField: "_id",
//           as: "user",
//         },
//       },
//       { $unwind: "$user" },
//       {
//         $match: {
//           "user.isActive": true,
//         },
//       },
//     ];

//     // Add geospatial filtering if coordinates provided
//     if (latitude && longitude) {
//       pipeline.push({
//         $addFields: {
//           distance: {
//             $multiply: [
//               {
//                 $acos: {
//                   $add: [
//                     {
//                       $multiply: [
//                         { $sin: { $degreesToRadians: parseFloat(latitude) } },
//                         {
//                           $sin: {
//                             $degreesToRadians: {
//                               $arrayElemAt: ["$user.location.coordinates", 1],
//                             },
//                           },
//                         },
//                       ],
//                     },
//                     {
//                       $multiply: [
//                         { $cos: { $degreesToRadians: parseFloat(latitude) } },
//                         {
//                           $cos: {
//                             $degreesToRadians: {
//                               $arrayElemAt: ["$user.location.coordinates", 1],
//                             },
//                           },
//                         },
//                         {
//                           $cos: {
//                             $degreesToRadians: {
//                               $subtract: [
//                                 parseFloat(longitude),
//                                 {
//                                   $arrayElemAt: [
//                                     "$user.location.coordinates",
//                                     0,
//                                   ],
//                                 },
//                               ],
//                             },
//                           },
//                         },
//                       ],
//                     },
//                   ],
//                 },
//               },
//               6371, // Earth's radius in kilometers
//             ],
//           },
//         },
//       });

//       pipeline.push({
//         $match: {
//           distance: { $lte: parseFloat(radius) },
//         },
//       });

//       pipeline.push({
//         $sort: { distance: 1, "rating.average": -1 },
//       });
//     } else {
//       pipeline.push({
//         $sort: { "rating.average": -1, "stats.completedBookings": -1 },
//       });
//     }

//     // Add pagination
//     pipeline.push({ $skip: (page - 1) * limit }, { $limit: parseInt(limit) });

//     const workers = await Worker.aggregate(pipeline);

//     // Get total count for pagination
//     const totalPipeline = pipeline.slice(0, -2); // Remove skip and limit
//     totalPipeline.push({ $count: "total" });
//     const totalResult = await Worker.aggregate(totalPipeline);
//     const total = totalResult[0]?.total || 0;

//     res.status(200).json({
//       success: true,
//       workers,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     console.error("Get available workers error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching workers",
//     });
//   }
// };

// // @desc    Get worker public profile
// // @route   GET /api/workers/:id
// // @access  Public
// exports.getWorkerPublicProfile = async (req, res) => {
//   try {
//     const worker = await Worker.findById(req.params.id)
//       .populate("user", "name avatar bio location")
//       .select("-documents -backgroundCheck");

//     if (!worker || worker.applicationStatus !== "approved") {
//       return res.status(404).json({
//         success: false,
//         message: "Worker not found",
//       });
//     }

//     // Get recent reviews
//     const recentReviews = await Booking.find({
//       worker: worker._id,
//       "review.rating": { $exists: true },
//     })
//       .populate("customer.user", "name")
//       .select("review service")
//       .populate("service", "name")
//       .sort({ "review.reviewDate": -1 })
//       .limit(5);

//     res.status(200).json({
//       success: true,
//       worker,
//       recentReviews,
//     });
//   } catch (error) {
//     console.error("Get worker public profile error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching worker profile",
//     });
//   }
// };

// // @desc    Reapply as worker (for rejected applications)
// // @route   POST /api/workers/reapply
// // @access  Private
// exports.reapplyAsWorker = async (req, res) => {
//   try {
//     const existingWorker = await Worker.findOne({ user: req.user.id });

//     if (!existingWorker) {
//       return res.status(404).json({
//         success: false,
//         message: "No previous application found",
//       });
//     }

//     if (existingWorker.applicationStatus !== "rejected") {
//       return res.status(400).json({
//         success: false,
//         message: "Can only reapply for rejected applications",
//       });
//     }

//     // Update the existing application
//     const {
//       firstName,
//       lastName,
//       email,
//       phone,
//       address,
//       services,
//       experience,
//       hourlyRate,
//       availability,
//       bio,
//       hasConvictions,
//       convictionDetails,
//     } = req.body;

//     existingWorker.firstName = firstName.trim();
//     existingWorker.lastName = lastName.trim();
//     existingWorker.email = email.trim().toLowerCase();
//     existingWorker.phone = phone.trim();
//     existingWorker.address = address.trim();
//     existingWorker.services = services;
//     existingWorker.experience = experience;
//     existingWorker.hourlyRate = parseFloat(hourlyRate);
//     existingWorker.availability = availability;
//     existingWorker.bio = bio.trim();
//     existingWorker.backgroundCheck = {
//       hasConvictions: hasConvictions || false,
//       convictionDetails: hasConvictions ? convictionDetails : "",
//     };
//     existingWorker.applicationStatus = "pending";
//     existingWorker.submittedAt = new Date();
//     existingWorker.rejectionReason = undefined;

//     await existingWorker.save();

//     res.status(200).json({
//       success: true,
//       message: "Worker application resubmitted successfully",
//       worker: {
//         id: existingWorker._id,
//         applicationStatus: existingWorker.applicationStatus,
//         submittedAt: existingWorker.submittedAt,
//       },
//     });
//   } catch (error) {
//     console.error("Reapply as worker error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while resubmitting application",
//     });
//   }
// };

// module.exports = exports;
