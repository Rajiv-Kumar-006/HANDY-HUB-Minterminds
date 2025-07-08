const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Worker = require('../models/Worker');
const User = require('../models/User');
const emailService = require('../services/emailService');
const { validationResult } = require('express-validator');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public (allows guest bookings)
exports.createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      serviceId,
      workerId,
      scheduledDate,
      scheduledTime,
      location,
      guestInfo,
      notes
    } = req.body;

    // Validate service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Validate worker exists and is approved
    const worker = await Worker.findById(workerId).populate('user');
    if (!worker || worker.applicationStatus !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'Worker not found or not approved'
      });
    }

    // Check if worker is available at the requested time
    const isAvailable = worker.isAvailableAt(
      scheduledDate,
      scheduledTime.start,
      scheduledTime.end
    );

    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Worker is not available at the requested time'
      });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      worker: workerId,
      scheduledDate: new Date(scheduledDate),
      status: { $in: ['pending', 'confirmed', 'in-progress'] },
      $or: [
        {
          'scheduledTime.start': { $lt: scheduledTime.end },
          'scheduledTime.end': { $gt: scheduledTime.start }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Worker already has a booking at this time'
      });
    }

    // Calculate pricing
    const basePrice = worker.hourlyRate;
    const duration = calculateDuration(scheduledTime.start, scheduledTime.end);
    const totalAmount = Math.round((basePrice * duration) / 60); // Convert minutes to hours

    // Create booking object
    const bookingData = {
      service: serviceId,
      worker: workerId,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      location,
      pricing: {
        basePrice,
        totalAmount
      },
      notes: {
        customer: notes || ''
      }
    };

    // Handle customer info (registered user vs guest)
    if (req.user) {
      bookingData.customer = { user: req.user.id };
    } else {
      if (!guestInfo || !guestInfo.name || !guestInfo.email || !guestInfo.phone) {
        return res.status(400).json({
          success: false,
          message: 'Guest information is required for non-registered users'
        });
      }
      bookingData.customer = { guestInfo };
    }

    // Create booking
    const booking = await Booking.create(bookingData);

    // Populate booking with related data
    await booking.populate([
      { path: 'service' },
      { path: 'worker', populate: { path: 'user' } },
      { path: 'customer.user' }
    ]);

    // Update worker stats
    worker.stats.totalBookings += 1;
    await worker.save();

    // Update service popularity
    await service.updatePopularity();

    // Send confirmation emails
    const customerEmail = req.user ? req.user.email : guestInfo.email;
    const customerName = req.user ? req.user.name : guestInfo.name;

    await emailService.sendBookingConfirmation(
      customerEmail,
      customerName,
      booking
    );

    await emailService.sendWorkerBookingNotification(
      worker.user.email,
      worker.user.name,
      booking
    );

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating booking'
    });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { 'customer.user': req.user.id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('service')
      .populate({
        path: 'worker',
        populate: { path: 'user', select: 'name email phone avatar' }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings'
    });
  }
};

// @desc    Get worker's bookings
// @route   GET /api/bookings/worker-bookings
// @access  Private (Worker only)
exports.getWorkerBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Find worker profile
    const worker = await Worker.findOne({ user: req.user.id });
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found'
      });
    }

    const query = { worker: worker._id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('service')
      .populate('customer.user', 'name email phone avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get worker bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings'
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service')
      .populate({
        path: 'worker',
        populate: { path: 'user', select: 'name email phone avatar' }
      })
      .populate('customer.user', 'name email phone avatar');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has permission to view this booking
    const isCustomer = booking.customer.user && 
                      booking.customer.user._id.toString() === req.user.id;
    const isWorker = booking.worker.user._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isWorker && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking'
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId)
      .populate('worker')
      .populate('customer.user');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions
    const isWorker = booking.worker.user.toString() === req.user.id;
    const isCustomer = booking.customer.user && 
                      booking.customer.user._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Define allowed status transitions
    const allowedTransitions = {
      worker: {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['in-progress', 'cancelled'],
        'in-progress': ['completed']
      },
      customer: {
        pending: ['cancelled'],
        confirmed: ['cancelled']
      },
      admin: {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['in-progress', 'completed', 'cancelled'],
        'in-progress': ['completed', 'cancelled']
      }
    };

    let userRole = 'customer';
    if (isWorker) userRole = 'worker';
    if (isAdmin) userRole = 'admin';

    if (!isWorker && !isCustomer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Check if status transition is allowed
    const currentStatus = booking.status;
    const allowedStatuses = allowedTransitions[userRole][currentStatus] || [];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${currentStatus} to ${status}`
      });
    }

    // Update booking status
    await booking.updateStatus(status, req.user.id, notes);

    // Handle specific status changes
    if (status === 'confirmed' && isWorker) {
      // Send confirmation email to customer
      const customerEmail = booking.customer.user ? 
                           booking.customer.user.email : 
                           booking.customer.guestInfo.email;
      const customerName = booking.customer.user ? 
                          booking.customer.user.name : 
                          booking.customer.guestInfo.name;

      await emailService.sendBookingStatusUpdate(
        customerEmail,
        customerName,
        booking,
        'confirmed'
      );
    }

    if (status === 'completed') {
      // Update worker stats
      const worker = await Worker.findById(booking.worker._id);
      worker.stats.completedBookings += 1;
      worker.stats.totalEarnings += booking.pricing.totalAmount;
      await worker.save();

      // Send completion emails
      const customerEmail = booking.customer.user ? 
                           booking.customer.user.email : 
                           booking.customer.guestInfo.email;
      const customerName = booking.customer.user ? 
                          booking.customer.user.name : 
                          booking.customer.guestInfo.name;

      await emailService.sendBookingStatusUpdate(
        customerEmail,
        customerName,
        booking,
        'completed'
      );
    }

    if (status === 'cancelled') {
      // Update worker stats
      const worker = await Worker.findById(booking.worker._id);
      worker.stats.cancelledBookings += 1;
      await worker.save();

      // Handle cancellation logic (refunds, notifications, etc.)
      booking.cancellation = {
        reason: notes || 'No reason provided',
        cancelledBy: req.user.id,
        cancelledAt: new Date()
      };
      await booking.save();
    }

    // Populate updated booking
    await booking.populate([
      { path: 'service' },
      { path: 'worker', populate: { path: 'user' } },
      { path: 'customer.user' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      booking
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating booking status'
    });
  }
};

// @desc    Add review to booking
// @route   POST /api/bookings/:id/review
// @access  Private (Customer only)
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const bookingId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate('worker');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is the customer
    const isCustomer = booking.customer.user && 
                      booking.customer.user.toString() === req.user.id;

    if (!isCustomer) {
      return res.status(403).json({
        success: false,
        message: 'Only customers can add reviews'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }

    // Check if review already exists
    if (booking.review.rating) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this booking'
      });
    }

    // Add review to booking
    booking.review = {
      rating,
      comment: comment || '',
      reviewDate: new Date()
    };
    await booking.save();

    // Update worker rating
    const worker = await Worker.findById(booking.worker._id);
    await worker.updateRating(rating);

    res.status(200).json({
      success: true,
      message: 'Review added successfully',
      review: booking.review
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding review'
    });
  }
};

// @desc    Get booking by code (for guests)
// @route   GET /api/bookings/code/:code
// @access  Public
exports.getBookingByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required to view booking'
      });
    }

    const booking = await Booking.findOne({
      bookingCode: code.toUpperCase(),
      $or: [
        { 'customer.guestInfo.email': email.toLowerCase() },
        { 'customer.user': { $exists: true } }
      ]
    })
    .populate('service')
    .populate({
      path: 'worker',
      populate: { path: 'user', select: 'name email phone avatar' }
    })
    .populate('customer.user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found with this code and email'
      });
    }

    // Verify email matches
    const bookingEmail = booking.customer.user ? 
                        booking.customer.user.email : 
                        booking.customer.guestInfo.email;

    if (bookingEmail.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Email does not match booking records'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Get booking by code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking'
    });
  }
};

// Helper function to calculate duration in minutes
function calculateDuration(startTime, endTime) {
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  return (end - start) / (1000 * 60); // Convert to minutes
}