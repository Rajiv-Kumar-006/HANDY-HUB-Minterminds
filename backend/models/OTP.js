const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['email-verification', 'password-reset', 'login'],
    required: true
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Generate random 6-digit OTP
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Verify OTP
otpSchema.methods.verify = function(inputOTP) {
  if (this.isUsed) {
    throw new Error('OTP has already been used');
  }
  
  if (this.attempts >= 3) {
    throw new Error('Maximum OTP attempts exceeded');
  }
  
  if (new Date() > this.expiresAt) {
    throw new Error('OTP has expired');
  }
  
  this.attempts += 1;
  
  if (this.otp !== inputOTP) {
    this.save();
    throw new Error('Invalid OTP');
  }
  
  this.isUsed = true;
  this.save();
  return true;
};

module.exports = mongoose.model('OTP', otpSchema);