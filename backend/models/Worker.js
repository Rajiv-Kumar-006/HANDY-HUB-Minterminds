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
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[\d\s-]{10,}$/, "Please enter a valid phone number"],
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    services: {
      type: [String],
      required: true,
      enum: [
        "House Cleaning",
        "Deep Cleaning",
        "Office Cleaning",
        "Plumbing",
        "Electrical",
        "Gardening",
        "Handyman",
        "Painting",
        "Cooking",
        "Laundry",
        "Automotive",
      ],
    },
    experience: {
      type: String,
      required: true,
      enum: ["0-1", "1-3", "3-5", "5-10", "10+"],
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 10,
      max: 200,
    },
    availability: {
      type: [String],
      required: true,
      enum: [
        "Monday Morning",
        "Monday Afternoon",
        "Monday Evening",
        "Tuesday Morning",
        "Tuesday Afternoon",
        "Tuesday Evening",
        "Wednesday Morning",
        "Wednesday Afternoon",
        "Wednesday Evening",
        "Thursday Morning",
        "Thursday Afternoon",
        "Thursday Evening",
        "Friday Morning",
        "Friday Afternoon",
        "Friday Evening",
        "Saturday Morning",
        "Saturday Afternoon",
        "Saturday Evening",
        "Sunday Morning",
        "Sunday Afternoon",
        "Sunday Evening",
      ],
    },
    bio: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 500,
    },
    documents: {
      idDocument: {
        url: String,
        publicId: String,
        originalName: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
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
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    backgroundCheck: {
      hasConvictions: {
        type: Boolean,
        default: false,
      },
      convictionDetails: {
        type: String,
        default: "",
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
      enum: ["incomplete", "pending", "approved", "rejected"],
      default: "incomplete",
    },
    submittedAt: Date,
    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: String,
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    stats: {
      totalBookings: { type: Number, default: 0 },
      completedBookings: { type: Number, default: 0 },
      cancelledBookings: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
      responseRate: { type: Number, default: 100 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
workerSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

workerSchema.virtual("completionRate").get(function () {
  if (this.stats.totalBookings === 0) return 100;
  return Math.round(
    (this.stats.completedBookings / this.stats.totalBookings) * 100
  );
});

// Indexes
workerSchema.index({ user: 1 });
workerSchema.index({ applicationStatus: 1 });
workerSchema.index({ services: 1 });
workerSchema.index({ isAvailable: 1, isVerified: 1 });

// Methods
workerSchema.methods.updateRating = function (newRating) {
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

workerSchema.methods.submitApplication = function () {
  this.applicationStatus = "pending";
  this.submittedAt = new Date();
  return this.save();
};

// Pre-save validation
workerSchema.pre("save", function (next) {
  if (this.applicationStatus === "pending") {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "bio",
    ];
    const missingFields = requiredFields.filter((field) => !this[field]);

    if (missingFields.length > 0) {
      return next(
        new Error(`Missing required fields: ${missingFields.join(", ")}`)
      );
    }

    if (!this.services || this.services.length === 0) {
      return next(new Error("At least one service must be selected"));
    }

    if (!this.availability || this.availability.length === 0) {
      return next(new Error("At least one availability slot must be selected"));
    }

    if (!this.documents.idDocument) {
      return next(new Error("ID document is required for submission"));
    }
  }

  next();
});

module.exports = mongoose.model("Worker", workerSchema);