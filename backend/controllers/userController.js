const User = require("../models/User");
const Worker = require("../models/Worker");
const Booking = require("../models/Booking");
const AppError = require("../utils/appError");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload avatar to Cloudinary
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => {
        if (error) {
          reject(new AppError("Failed to upload avatar", 500));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );
    Readable.from(file.buffer).pipe(stream);
  });
};

// Get user profile with stats
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Fetch booking stats
    const bookings = await Booking.find({ customer: user._id });
    const upcomingBookings = bookings.filter(
      (b) => b.status === "confirmed" || b.status === "pending"
    ).length;
    const completedBookings = bookings.filter(
      (b) => b.status === "completed"
    ).length;

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        totalBookings: user.totalBookings,
        upcomingBookings,
        completedBookings,
        rating: user.rating.average,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const updatableFields = [
      "name",
      "phone",
      "bio",
      "address.street",
      "address.city",
      "address.state",
      "address.zipCode",
      "address.country",
      "address.fullAddress",
      "location.coordinates",
      "preferences.emailNotifications",
      "preferences.smsNotifications",
      "preferences.marketingEmails",
    ];

    if (req.file) {
      const uploadedAvatar = await uploadToCloudinary(req.file);
      if (user.avatar) {
        const oldPublicId = user.avatar.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(oldPublicId);
      }
      user.avatar = uploadedAvatar.url;
    }

    Object.keys(req.body).forEach((key) => {
      if (updatableFields.includes(key)) {
        if (key.includes(".")) {
          const [parent, child] = key.split(".");
          user[parent][child] = req.body[key];
        } else {
          user[key] = req.body[key];
        }
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { search, role } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select(
      "name email role isActive createdAt lastLogin totalBookings rating"
    );

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update user
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const updatableFields = [
      "name",
      "email",
      "phone",
      "role",
      "isActive",
      "bio",
      "address.street",
      "address.city",
      "address.state",
      "address.zipCode",
      "address.country",
      "address.fullAddress",
      "location.coordinates",
    ];

    if (req.file) {
      const uploadedAvatar = await uploadToCloudinary(req.file);
      if (user.avatar) {
        const oldPublicId = user.avatar.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(oldPublicId);
      }
      user.avatar = uploadedAvatar.url;
    }

    Object.keys(req.body).forEach((key) => {
      if (updatableFields.includes(key)) {
        if (key.includes(".")) {
          const [parent, child] = key.split(".");
          user[parent][child] = req.body[key];
        } else {
          user[key] = req.body[key];
        }
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Check if user has an associated worker application
    const worker = await Worker.findOne({ user: user._id });
    if (worker) {
      return next(
        new AppError(
          "Cannot delete user with an associated worker application",
          400
        )
      );
    }

    // Delete avatar from Cloudinary if exists
    if (user.avatar) {
      const publicId = user.avatar.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await user.remove();

    res.status(204).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


// const User = require('../models/User');
// const Booking = require('../models/Booking');
// const { validationResult } = require('express-validator');

// // @desc    Get user profile
// // @route   GET /api/users/profile
// // @access  Private
// exports.getUserProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password');

//     res.status(200).json({
//       success: true,
//       user
//     });

//   } catch (error) {
//     console.error('Get user profile error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching user profile'
//     });
//   }
// };

// // In user.controller.js
// exports.updateUser = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return next(new AppError("User not found", 404));
//     }
//     // Allow updating role for admins
//     if (req.body.role && req.user.role !== "admin") {
//       return next(new AppError("Only admins can update roles", 403));
//     }
//     const allowedFields = ["name", "email", "phone", "role", "isActive"];
//     Object.keys(req.body).forEach((key) => {
//       if (allowedFields.includes(key)) {
//         user[key] = req.body[key];
//       }
//     });
//     await user.save({ validateBeforeSave: false });
//     res.status(200).json({
//       success: true,
//       data: user,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // @desc    Update user profile
// // @route   PUT /api/users/profile
// // @access  Private
// exports.updateUserProfile = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation errors',
//         errors: errors.array()
//       });
//     }

//     const {
//       name,
//       phone,
//       bio,
//       address,
//       location,
//       preferences
//     } = req.body;

//     const updateData = {};

//     // Only update provided fields
//     if (name) updateData.name = name;
//     if (phone) updateData.phone = phone;
//     if (bio) updateData.bio = bio;
//     if (address) updateData.address = address;
//     if (location) updateData.location = location;
//     if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

//     const user = await User.findByIdAndUpdate(
//       req.user.id,
//       updateData,
//       { new: true, runValidators: true }
//     ).select('-password');

//     res.status(200).json({
//       success: true,
//       message: 'Profile updated successfully',
//       user
//     });

//   } catch (error) {
//     console.error('Update user profile error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while updating profile'
//     });
//   }
// };

// // @desc    Get user dashboard stats
// // @route   GET /api/users/dashboard
// // @access  Private
// exports.getUserDashboard = async (req, res) => {
//   try {
//     // Get user's booking stats
//     const totalBookings = await Booking.countDocuments({
//       'customer.user': req.user.id
//     });

//     const upcomingBookings = await Booking.countDocuments({
//       'customer.user': req.user.id,
//       status: { $in: ['pending', 'confirmed'] },
//       scheduledDate: { $gte: new Date() }
//     });

//     const completedBookings = await Booking.countDocuments({
//       'customer.user': req.user.id,
//       status: 'completed'
//     });

//     // Get recent bookings
//     const recentBookings = await Booking.find({
//       'customer.user': req.user.id
//     })
//     .populate('service', 'name')
//     .populate('worker', 'user')
//     .sort({ createdAt: -1 })
//     .limit(5);

//     // Calculate total spent
//     const totalSpent = await Booking.aggregate([
//       {
//         $match: {
//           'customer.user': req.user._id,
//           status: 'completed'
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: '$pricing.totalAmount' }
//         }
//       }
//     ]);

//     // Get favorite services (most booked)
//     const favoriteServices = await Booking.aggregate([
//       {
//         $match: {
//           'customer.user': req.user._id
//         }
//       },
//       {
//         $group: {
//           _id: '$service',
//           count: { $sum: 1 }
//         }
//       },
//       {
//         $lookup: {
//           from: 'services',
//           localField: '_id',
//           foreignField: '_id',
//           as: 'service'
//         }
//       },
//       { $unwind: '$service' },
//       { $sort: { count: -1 } },
//       { $limit: 3 }
//     ]);

//     const stats = {
//       totalBookings,
//       upcomingBookings,
//       completedBookings,
//       totalSpent: totalSpent[0]?.total || 0,
//       favoriteServices
//     };

//     res.status(200).json({
//       success: true,
//       stats,
//       recentBookings
//     });

//   } catch (error) {
//     console.error('Get user dashboard error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching dashboard data'
//     });
//   }
// };

// // @desc    Update user location
// // @route   PUT /api/users/location
// // @access  Private
// exports.updateUserLocation = async (req, res) => {
//   try {
//     const { coordinates, address } = req.body;

//     if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
//       return res.status(400).json({
//         success: false,
//         message: 'Valid coordinates [longitude, latitude] are required'
//       });
//     }

//     const user = await User.findByIdAndUpdate(
//       req.user.id,
//       {
//         location: {
//           type: 'Point',
//           coordinates
//         },
//         'address.fullAddress': address
//       },
//       { new: true }
//     ).select('-password');

//     res.status(200).json({
//       success: true,
//       message: 'Location updated successfully',
//       user
//     });

//   } catch (error) {
//     console.error('Update user location error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while updating location'
//     });
//   }
// };

// // @desc    Delete user account
// // @route   DELETE /api/users/account
// // @access  Private
// exports.deleteUserAccount = async (req, res) => {
//   try {
//     const { password } = req.body;

//     if (!password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Password is required to delete account'
//       });
//     }

//     // Get user with password
//     const user = await User.findById(req.user.id).select('+password');

//     // Verify password
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid password'
//       });
//     }

//     // Check for active bookings
//     const activeBookings = await Booking.countDocuments({
//       'customer.user': req.user.id,
//       status: { $in: ['pending', 'confirmed', 'in-progress'] }
//     });

//     if (activeBookings > 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Cannot delete account with active bookings. Please cancel or complete all bookings first.'
//       });
//     }

//     // Soft delete - deactivate account instead of hard delete
//     await User.findByIdAndUpdate(req.user.id, {
//       isActive: false,
//       email: `deleted_${Date.now()}_${user.email}` // Prevent email conflicts
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Account deleted successfully'
//     });

//   } catch (error) {
//     console.error('Delete user account error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while deleting account'
//     });
//   }
// };

// module.exports = exports;
