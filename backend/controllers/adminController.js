const User = require("../models/User");
const Worker = require("../models/Worker");
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const { validationResult } = require("express-validator");
const emailService = require("../services/emailService");
const AppError = require("../utils/appError");

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
exports.getAdminDashboard = async (req, res) => {
  try {
    // Get basic counts
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalWorkers = await Worker.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalServices = await Service.countDocuments();

    // Get pending worker applications
    const pendingWorkers = await Worker.countDocuments({
      applicationStatus: "pending",
    });

    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate("service", "name")
      .populate("worker", "user")
      .populate("customer.user", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get monthly stats
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyBookings = await Booking.countDocuments({
      createdAt: { $gte: thisMonth },
    });

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: thisMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$pricing.totalAmount" },
        },
      },
    ]);

    // Get top services
    const topServices = await Booking.aggregate([
      {
        $group: {
          _id: "$service",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: "$service" },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const stats = {
      totalUsers,
      totalWorkers,
      totalBookings,
      totalServices,
      pendingWorkers,
      monthlyBookings,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      topServices,
    };

    res.status(200).json({
      success: true,
      stats,
      recentBookings,
    });
  } catch (error) {
    console.error("Get admin dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard data",
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, status } = req.query;

    let query = {};

    // Filter by role
    if (role && role !== "all") {
      query.role = role;
    }

    // Filter by status
    if (status && status !== "all") {
      query.isActive = status === "active";
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};

// @desc    Get pending worker applications
// @route   GET /api/admin/workers/pending
// @access  Private (Admin only)
exports.getPendingWorkers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const workers = await Worker.find({ applicationStatus: "pending" })
      .populate("user", "name email phone createdAt")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Worker.countDocuments({ applicationStatus: "pending" });

    res.status(200).json({
      success: true,
      workers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get pending workers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching pending workers",
    });
  }
};

// @desc    Approve/Reject worker application
// @route   PUT /api/admin/workers/:id/status
// @access  Private (Admin only)
exports.updateWorkerStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const workerId = req.params.id;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either approved or rejected",
      });
    }

    const worker = await Worker.findById(workerId).populate("user");

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    // Update worker status
    worker.applicationStatus = status;
    worker.approvedBy = req.user.id;
    worker.approvedAt = new Date();

    if (status === "approved") {
      worker.isVerified = true;
      // Update user role to worker
      await User.findByIdAndUpdate(worker.user._id, { role: "worker" });
    }

    await worker.save();

    // Send notification email
    if (status === "approved") {
      await emailService.sendWorkerApprovalEmail(
        worker.user.email,
        worker.user.name
      );
    } else {
      await emailService.sendWorkerRejectionEmail(
        worker.user.email,
        worker.user.name,
        notes
      );
    }

    res.status(200).json({
      success: true,
      message: `Worker application ${status} successfully`,
      worker,
    });
  } catch (error) {
    console.error("Update worker status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating worker status",
    });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private (Admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    let query = {};

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Search functionality
    if (search) {
      query.bookingCode = { $regex: search, $options: "i" };
    }

    const bookings = await Booking.find(query)
      .populate("service", "name")
      .populate("worker", "user")
      .populate("customer.user", "name email")
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
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching bookings",
    });
  }
};

// @desc    Get all services
// @route   GET /api/admin/services
// @access  Private (Admin only)
exports.getAllServices = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;

    let query = {};

    // Filter by category
    if (category && category !== "all") {
      query.category = category;
    }

    // Search functionality
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const services = await Service.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Service.countDocuments(query);

    res.status(200).json({
      success: true,
      services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all services error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching services",
    });
  }
};

// @desc    Create new service
// @route   POST /api/admin/services
// @access  Private (Admin only)
exports.createService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const service = await Service.create(req.body);

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error("Create service error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating service",
    });
  }
};

// @desc    Update service
// @route   PUT /api/admin/services/:id
// @access  Private (Admin only)
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    console.error("Update service error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating service",
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/admin/services/:id
// @access  Private (Admin only)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Check if service has active bookings
    const activeBookings = await Booking.countDocuments({
      service: req.params.id,
      status: { $in: ["pending", "confirmed", "in-progress"] },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete service with active bookings",
      });
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting service",
    });
  }
};

// @desc    Toggle user status (activate/deactivate)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot deactivate your own account",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${
        user.isActive ? "activated" : "deactivated"
      } successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating user status",
    });
  }
};

// 1. Get all worker applications (for Admin dashboard)
exports.getAllWorkerApplications = async (req, res, next) => {
  try {
    const applications = await WorkerApplication.find().populate(
      "user",
      "name email role"
    );
    res.status(200).json({ success: true, applications });
  } catch (error) {
    next(error);
  }
};

// 2. Approve a worker application
exports.approveWorkerApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await WorkerApplication.findById(id);
    if (!application) return next(new AppError("Application not found", 404));
    if (application.status !== "pending")
      return next(
        new AppError(`Application already ${application.status}`, 400)
      );

    application.status = "approved";
    await application.save();

    // Update user role
    await User.findByIdAndUpdate(application.user, { role: "worker" });

    res.status(200).json({
      success: true,
      message: "Application approved and user role updated",
    });
  } catch (error) {
    next(error);
  }
};

// 3. Reject a worker application
exports.rejectWorkerApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await WorkerApplication.findById(id);
    if (!application) return next(new AppError("Application not found", 404));
    if (application.status !== "pending")
      return next(
        new AppError(`Application already ${application.status}`, 400)
      );

    application.status = "rejected";
    await application.save();

    res.status(200).json({ success: true, message: "Application rejected" });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
