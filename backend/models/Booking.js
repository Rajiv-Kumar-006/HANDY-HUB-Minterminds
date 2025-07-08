const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingCode: {
    type: String,
    unique: true,
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  customer: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // null for guest bookings
    },
    guestInfo: {
      name: String,
      email: String,
      phone: String,
      address: String
    }
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    start: {
      type: String,
      required: true
    },
    end: {
      type: String,
      required: true
    }
  },
  location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    instructions: String
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    additionalCharges: [{
      description: String,
      amount: Number
    }],
    totalAmount: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  notes: {
    customer: String,
    worker: String,
    admin: String
  },
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    reviewDate: Date
  },
  cancellation: {
    reason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    refundAmount: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate unique booking code
bookingSchema.pre('save', function(next) {
  if (!this.bookingCode) {
    this.bookingCode = 'HH' + Date.now().toString(36).toUpperCase() + 
                      Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

// Virtual for customer info (handles both registered users and guests)
bookingSchema.virtual('customerInfo').get(function() {
  if (this.customer.user) {
    return {
      type: 'registered',
      id: this.customer.user._id,
      name: this.customer.user.name,
      email: this.customer.user.email,
      phone: this.customer.user.phone
    };
  } else {
    return {
      type: 'guest',
      ...this.customer.guestInfo
    };
  }
});

// Check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const scheduledDateTime = new Date(this.scheduledDate);
  const hoursDifference = (scheduledDateTime - now) / (1000 * 60 * 60);
  
  return this.status === 'pending' || 
         (this.status === 'confirmed' && hoursDifference > 24);
};

// Update booking status with timeline
bookingSchema.methods.updateStatus = function(newStatus, updatedBy, notes = '') {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    updatedBy,
    notes
  });
  return this.save();
};

module.exports = mongoose.model('Booking', bookingSchema);