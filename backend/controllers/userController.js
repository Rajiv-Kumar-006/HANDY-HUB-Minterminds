const User = require('../models/User');
const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
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
      name,
      phone,
      bio,
      address,
      location,
      preferences
    } = req.body;

    const updateData = {};

    // Only update provided fields
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (bio) updateData.bio = bio;
    if (address) updateData.address = address;
    if (location) updateData.location = location;
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard
// @access  Private
exports.getUserDashboard = async (req, res) => {
  try {
    // Get user's booking stats
    const totalBookings = await Booking.countDocuments({
      'customer.user': req.user.id
    });

    const upcomingBookings = await Booking.countDocuments({
      'customer.user': req.user.id,
      status: { $in: ['pending', 'confirmed'] },
      scheduledDate: { $gte: new Date() }
    });

    const completedBookings = await Booking.countDocuments({
      'customer.user': req.user.id,
      status: 'completed'
    });

    // Get recent bookings
    const recentBookings = await Booking.find({
      'customer.user': req.user.id
    })
    .populate('service', 'name')
    .populate('worker', 'user')
    .sort({ createdAt: -1 })
    .limit(5);

    // Calculate total spent
    const totalSpent = await Booking.aggregate([
      {
        $match: {
          'customer.user': req.user._id,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.totalAmount' }
        }
      }
    ]);

    // Get favorite services (most booked)
    const favoriteServices = await Booking.aggregate([
      {
        $match: {
          'customer.user': req.user._id
        }
      },
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'service'
        }
      },
      { $unwind: '$service' },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    const stats = {
      totalBookings,
      upcomingBookings,
      completedBookings,
      totalSpent: totalSpent[0]?.total || 0,
      favoriteServices
    };

    res.status(200).json({
      success: true,
      stats,
      recentBookings
    });

  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
};

// @desc    Update user location
// @route   PUT /api/users/location
// @access  Private
exports.updateUserLocation = async (req, res) => {
  try {
    const { coordinates, address } = req.body;

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Valid coordinates [longitude, latitude] are required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        location: {
          type: 'Point',
          coordinates
        },
        'address.fullAddress': address
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      user
    });

  } catch (error) {
    console.error('Update user location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating location'
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
exports.deleteUserAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      'customer.user': req.user.id,
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account with active bookings. Please cancel or complete all bookings first.'
      });
    }

    // Soft delete - deactivate account instead of hard delete
    await User.findByIdAndUpdate(req.user.id, {
      isActive: false,
      email: `deleted_${Date.now()}_${user.email}` // Prevent email conflicts
    });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete user account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting account'
    });
  }
};

module.exports = exports;