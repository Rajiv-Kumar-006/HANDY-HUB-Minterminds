const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    customer: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null, // null for guest bookings
      },
      guestInfo: {
        name: { type: String, trim: true },
        email: { type: String, trim: true },
        phone: { type: String, trim: true },
        address: { type: String, trim: true },
      },
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTime: {
      start: {
        type: String,
        required: true,
        trim: true,
      },
      end: {
        type: String,
        required: true,
        trim: true,
      },
    },
    location: {
      address: {
        type: String,
        required: true,
        trim: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      instructions: {
        type: String,
        trim: true,
      },
    },
    pricing: {
      basePrice: {
        type: Number,
        required: true,
      },
      additionalCharges: [
        {
          description: { type: String, trim: true },
          amount: Number,
        },
      ],
      totalAmount: {
        type: Number,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    notes: {
      customer: { type: String, trim: true },
      worker: { type: String, trim: true },
      admin: { type: String, trim: true },
    },
    timeline: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        notes: { type: String, trim: true },
      },
    ],
    review: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: { type: String, trim: true },
      reviewDate: Date,
    },
    cancellation: {
      reason: { type: String, trim: true },
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      cancelledAt: Date,
      refundAmount: Number,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save: generate unique bookingCode if not set
bookingSchema.pre("save", async function (next) {
  if (!this.bookingCode) {
    let isUnique = false;
    let code;
    while (!isUnique) {
      code =
        "HH" +
        Date.now().toString(36).toUpperCase() +
        Math.random().toString(36).substr(2, 4).toUpperCase();
      const existing = await this.constructor.findOne({ bookingCode: code });
      if (!existing) isUnique = true;
    }
    this.bookingCode = code;
  }
  next();
});

// Virtual: customerInfo
bookingSchema.virtual("customerInfo").get(function () {
  if (this.customer.user) {
    return { type: "registered", id: this.customer.user };
  } else {
    return { type: "guest", ...this.customer.guestInfo };
  }
});

// Virtual: provider
bookingSchema.virtual("provider", {
  ref: "Worker",
  localField: "worker",
  foreignField: "_id",
  justOne: true,
  options: { select: "name" },
});

// Method: canBeCancelled
bookingSchema.methods.canBeCancelled = function () {
  const now = new Date();
  const scheduledDateTime = new Date(this.scheduledDate);
  const hoursDiff = (scheduledDateTime - now) / (1000 * 60 * 60);

  return (
    this.status === "pending" || (this.status === "confirmed" && hoursDiff > 24)
  );
};

// Method: updateStatus
bookingSchema.methods.updateStatus = function (
  newStatus,
  updatedBy,
  notes = ""
) {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    updatedBy,
    notes,
  });
  return this.save();
};

// Static helper: validate ObjectId
bookingSchema.statics.isValidId = function (id) {
  return mongoose.Types.ObjectId.isValid(id);
};

// Indexes
bookingSchema.index({ bookingCode: 1 });
bookingSchema.index({ customer: 1 });
bookingSchema.index({ worker: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ "location.coordinates": "2dsphere" });

module.exports = mongoose.model("Booking", bookingSchema);