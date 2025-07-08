const express = require('express');
const {
  register,
  verifyEmail,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  resendOTP,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateOTP,
  validatePasswordReset
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/verify-email', validateOTP, verifyEmail);
router.post('/login', validateLogin, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', validatePasswordReset, resetPassword);
router.post('/resend-otp', resendOTP);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;