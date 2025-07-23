const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
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
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be more than 5"],
    },
    reviews: {
      type: Number,
      default: 0,
      min: [0, "Reviews cannot be negative"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Service", serviceSchema);


// const mongoose = require("mongoose");

// const serviceSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "Service name is required"],
//       trim: true,
//       unique: true,
//     },
//     title: {
//       type: String,
//       required: [true, "Service title is required"],
//       maxlength: [100, "Title cannot exceed 100 characters"],
//     },
//     description: {
//       type: String,
//       required: [true, "Service description is required"],
//       maxlength: [500, "Description cannot exceed 500 characters"],
//     },
//     category: {
//       type: String,
//       required: [true, "Service category is required"],
//       enum: ["cleaning", "cooking", "laundry"],
//     },
//     icon: {
//       type: String,
//       default: "wrench",
//     },
//     basePrice: {
//       min: {
//         type: Number,
//         required: true,
//         min: 0,
//       },
//       max: {
//         type: Number,
//         required: true,
//         min: 0,
//       },
//     },
//     duration: {
//       min: {
//         type: Number, 
//         required: true,
//         min: 30,
//       },
//       max: {
//         type: Number, 
//         required: true,
//         min: 30,
//       },
//     },
//     requirements: [String],
//     includes: [String],
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     popularity: {
//       type: Number,
//       default: 0,
//     },
//     averageRating: {
//       type: Number,
//       default: 0,
//       min: 0,
//       max: 5,
//     },
//     totalReviews: {
//       type: Number,
//       default: 0,
//     },
//   },
//   {
//     timestamps: true,
//   }
// ); 

// // Update popularity based on bookings
// serviceSchema.methods.updatePopularity = function () {
//   // This would be called when a new booking is made
//   this.popularity += 1;
//   return this.save();
// };

// module.exports = mongoose.model("Service", serviceSchema);
