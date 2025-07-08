const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: [
      'cleaning',
      'plumbing',
      'electrical',
      'gardening',
      'cooking',
      'handyman',
      'painting',
      'automotive',
      'petcare',
      'eldercare'
    ]
  },
  icon: {
    type: String,
    default: 'wrench'
  },
  basePrice: {
    min: {
      type: Number,
      required: true,
      min: 0
    },
    max: {
      type: Number,
      required: true,
      min: 0
    }
  },
  duration: {
    min: {
      type: Number, // in minutes
      required: true,
      min: 30
    },
    max: {
      type: Number, // in minutes
      required: true,
      min: 30
    }
  },
  requirements: [String],
  includes: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  popularity: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Update popularity based on bookings
serviceSchema.methods.updatePopularity = function() {
  // This would be called when a new booking is made
  this.popularity += 1;
  return this.save();
};

module.exports = mongoose.model('Service', serviceSchema);