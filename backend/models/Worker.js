const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    services: [
      {
        type: String,
        required: true,
        enum: ["cleaning", "cooking", "laundry"] // Updated to match your service categories
      },
    ],
    experience: {
      type: String,
      required: true,
      enum: ["0-1", "1-3", "3-5", "5-10", "10+"],
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: [10, "Hourly rate must be at least $10"],
      max: [200, "Hourly rate cannot exceed $200"],
    },
    availability: [
      {
        type: String,
        required: true,
      },
    ],
    bio: {
      type: String,
      required: true,
      trim: true,
      minlength: [50, "Bio must be at least 50 characters long"],
      maxlength: [500, "Bio cannot exceed 500 characters"]
    },
    documents: {
      idDocument: {
        url: String,
        publicId: String,
        originalName: String,
        uploadedAt: {
          type: Date,
          default: Date.now
        },
        verified: {
          type: Boolean,
          default: false,
        },
      },
      certifications: [
        {
          name: String,
          url: String,
          publicId: String,
          originalName: String,
          issueDate: Date,
          expiryDate: Date,
          uploadedAt: {
            type: Date,
            default: Date.now
          },
        },
      ],
    },
    backgroundCheck: {
      hasConvictions: {
        type: Boolean,
        default: false
      },
      convictionDetails: {
        type: String,
        default: '',
        required: function() {
          return this.backgroundCheck && this.backgroundCheck.hasConvictions;
        }
      },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      completedAt: Date,
      notes: String,
    },
    applicationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "incomplete"],
      default: "incomplete",
    },
    submittedAt: Date,
    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: String,
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    stats: {
      totalBookings: {
        type: Number,
        default: 0,
      },
      completedBookings: {
        type: Number,
        default: 0,
      },
      cancelledBookings: {
        type: Number,
        default: 0,
      },
      totalEarnings: {
        type: Number,
        default: 0,
      },
      responseRate: {
        type: Number,
        default: 100,
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for completion rate
workerSchema.virtual("completionRate").get(function () {
  if (this.stats.totalBookings === 0) return 100;
  return Math.round(
    (this.stats.completedBookings / this.stats.totalBookings) * 100
  );
});

// Virtual for full name
workerSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Index for better query performance
workerSchema.index({ user: 1 });
workerSchema.index({ applicationStatus: 1 });
workerSchema.index({ services: 1 });
workerSchema.index({ isAvailable: 1, isVerified: 1 });

// Update rating when new review is added
workerSchema.methods.updateRating = function (newRating) {
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

// Mark application as submitted
workerSchema.methods.submitApplication = function() {
  this.applicationStatus = 'pending';
  this.submittedAt = new Date();
  return this.save();
};

// Pre-save middleware to validate required fields based on application status
workerSchema.pre('save', function(next) {
  if (this.applicationStatus === 'pending') {
    // Validate required fields for submission
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'bio'];
    const missingFields = requiredFields.filter(field => !this[field]);

    if (missingFields.length > 0) {
      return next(new Error(`Missing required fields: ${missingFields.join(', ')}`));
    }

    if (!this.services || this.services.length === 0) {
      return next(new Error('At least one service must be selected'));
    }

    if (!this.availability || this.availability.length === 0) {
      return next(new Error('At least one availability slot must be selected'));
    }
  }

  next();
});

module.exports = mongoose.model("Worker", workerSchema);