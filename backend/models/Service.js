const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      maxlength: [100, "Name cannot exceed 100 characters"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Service title is required"],
      maxlength: [100, "Title cannot exceed 100 characters"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Service description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Service category is required"],
      enum: [
        "cleaning",
        "plumbing",
        "electrical",
        "gardening",
        "cooking",
        "handyman",
        "painting",
        "automotive",
      ],
    },
    provider: {
      type: String,
      required: [true, "Provider name is required"],
      trim: true,
    },
    basePrice: {
      min: {
        type: Number,
        required: [true, "Minimum price is required"],
        min: [0, "Price cannot be negative"],
      },
      max: {
        type: Number,
        required: [true, "Maximum price is required"],
        min: [0, "Price cannot be negative"],
      },
    },
    duration: {
      min: {
        type: Number,
        required: [true, "Minimum duration is required"],
        min: [0, "Duration cannot be negative"],
      },
      max: {
        type: Number,
        required: [true, "Maximum duration is required"],
        min: [0, "Duration cannot be negative"],
      },
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    icon: {
      type: String,
      default: "",
      trim: true,
    },
    requirements: {
      type: [String],
      default: [],
    },
    includes: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    popularity: {
      type: Number,
      default: 0,
      min: [0, "Popularity cannot be negative"],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be more than 5"],
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, "Reviews cannot be negative"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
serviceSchema.index({ category: 1 });
serviceSchema.index({ title: "text", provider: "text" });
serviceSchema.index({ isActive: 1 });

module.exports = mongoose.model("Service", serviceSchema);
