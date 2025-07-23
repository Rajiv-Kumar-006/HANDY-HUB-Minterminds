const Booking = require("../models/Booking");
const User = require("../models/User");
const Worker = require("../models/Worker");
const Service = require("../models/Service");
const AppError = require("../utils/appError");
const emailService = require("../services/emailService");

// Create a new booking
exports.createBooking = async (req, res, next) => {
  try {
    const {
      serviceId,
      scheduledDate,
      scheduledTime,
      location,
      guestInfo,
      notes,
    } = req.body;

    if (!serviceId || !scheduledDate || !scheduledTime || !location) {
      return next(new AppError("Missing required fields", 400));
    }

    // Validate service
    const service = await Service.findById(serviceId);
    if (!service) {
      return next(new AppError("Service not found", 404));
    }

    // Validate worker
    const worker = await Worker.findOne({ services: serviceId, isActive: true });
    if (!worker) {
      return next(new AppError("No available worker for this service", 404));
    }

    // Calculate end time (assuming duration from service)
    const duration = service.duration || 2; // Default 2 hours
    const startTime = scheduledTime;
    const startDateTime = new Date(`${scheduledDate}T${startTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 60 * 1000);
    const endTime = endDateTime.toTimeString().slice(0, 5);

    // Create booking
    const bookingData = {
      service: serviceId,
      worker: worker._id,
      scheduledDate,
      scheduledTime: { start: startTime, end: endTime },
      location,
      pricing: {
        basePrice: service.price,
        totalAmount: service.price, // Add additionalCharges logic if needed
      },
      notes: { customer: notes || "" },
    };

    if (req.user) {
      bookingData.customer = { user: req.user._id };
      // Increment user's totalBookings
      await User.findByIdAndUpdate(req.user._id, { $inc: { totalBookings: 1 } });
    } else {
      if (!guestInfo || !guestInfo.name || !guestInfo.email || !guestInfo.phone || !guestInfo.address) {
        return next(new AppError("Guest information required", 400));
      }
      bookingData.customer = { guestInfo };
    }

    const booking = await Booking.create(bookingData);

    // Send confirmation email
    const recipient = req.user ? req.user.email : guestInfo.email;
    const recipientName = req.user ? req.user.name : guestInfo.name;
    await emailService.sendBookingConfirmation(
      recipient,
      recipientName,
      booking.bookingCode,
      service.title,
      worker.name,
      scheduledDate,
      startTime
    );

    res.status(201).json({
      success: true,
      data: {
        bookingCode: booking.bookingCode,
        service: service.title,
        provider: worker.name,
        scheduledDate: booking.scheduledDate,
        scheduledTime: booking.scheduledTime.start,
        totalAmount: booking.pricing.totalAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user's bookings
exports.getUserBookings = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    const bookings = await Booking.find({ "customer.user": req.user._id })
      .populate("service", "title")
      .populate("worker", "name")
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings.map((booking) => ({
        id: booking._id,
        service: booking.service.title,
        provider: booking.worker.name,
        date: booking.scheduledDate,
        time: booking.scheduledTime.start,
        status: booking.status,
        price: booking.pricing.totalAmount,
        image: booking.image,
        rating: booking.review ? booking.review.rating : null,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Get all bookings (admin)
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { bookingCode: { $regex: search, $options: "i" } },
        { "customer.guestInfo.name": { $regex: search, $options: "i" } },
        { "customer.guestInfo.email": { $regex: search, $options: "i" } },
      ];
    }

    const bookings = await Booking.find(query)
      .populate("service", "title")
      .populate("worker", "name")
      .populate("customer.user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings.map((booking) => ({
        id: booking._id,
        service: booking.service.title,
        customer: booking.customer.user
          ? booking.customer.user.name
          : booking.customer.guestInfo.name,
        worker: booking.worker.name,
        date: booking.scheduledDate,
        time: booking.scheduledTime.start,
        status: booking.status,
        amount: booking.pricing.totalAmount,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    if (!booking.canBeCancelled()) {
      return next(new AppError("Booking cannot be cancelled at this time", 400));
    }

    if (
      req.user &&
      booking.customer.user &&
      booking.customer.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return next(new AppError("Not authorized to cancel this booking", 403));
    }

    booking.status = "cancelled";
    booking.isCancelled = true;
    booking.cancellation = {
      reason: req.body.reason || "Cancelled by user",
      cancelledBy: req.user ? req.user._id : null,
      cancelledAt: new Date(),
      refundAmount: req.body.refunded ? booking.pricing.totalAmount : 0,
    };
    booking.paymentStatus = req.body.refunded ? "refunded" : booking.paymentStatus;
    await booking.updateStatus("cancelled", req.user ? req.user._id : null, req.body.reason);

    // Send cancellation email
    const recipient = booking.customer.user
      ? (await User.findById(booking.customer.user)).email
      : booking.customer.guestInfo.email;
    const recipientName = booking.customer.user
      ? (await User.findById(booking.customer.user)).name
      : booking.customer.guestInfo.name;
    await emailService.sendBookingCancellation(
      recipient,
      recipientName,
      booking.bookingCode,
      booking.service.title
    );

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Submit a review
exports.submitReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return next(new AppError("Valid rating (1-5) is required", 400));
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    if (booking.status !== "completed") {
      return next(new AppError("Can only review completed bookings", 400));
    }

    if (
      req.user &&
      booking.customer.user &&
      booking.customer.user.toString() !== req.user._id.toString()
    ) {
      return next(new AppError("Not authorized to review this booking", 403));
    }

    booking.review = {
      rating,
      comment: comment || "",
      reviewDate: new Date(),
    };
    await booking.save();

    // Update worker's rating
    const worker = await Worker.findById(booking.worker);
    if (worker) {
      const user = await User.findById(worker.user);
      if (user) {
        await user.updateRating(rating);
      }
    }

    res.status(200).json({
      success: true,
      message: "Review submitted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Update a booking (admin)
exports.updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    const updatableFields = [
      "status",
      "paymentStatus",
      "notes.admin",
      "scheduledDate",
      "scheduledTime.start",
      "scheduledTime.end",
      "location.address",
      "location.coordinates",
      "location.instructions",
    ];

    Object.keys(req.body).forEach((key) => {
      if (updatableFields.includes(key)) {
        if (key.includes(".")) {
          const [parent, child] = key.split(".");
          booking[parent][child] = req.body[key];
        } else {
          booking[key] = req.body[key];
        }
      }
    });

    if (req.body.status && req.body.status !== booking.status) {
      await booking.updateStatus(req.body.status, req.user._id, req.body.notes?.admin);
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};