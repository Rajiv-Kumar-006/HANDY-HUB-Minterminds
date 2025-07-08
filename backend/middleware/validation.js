const { body, param, query } = require('express-validator');

// User registration validation
exports.validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('role')
    .optional()
    .isIn(['user', 'worker'])
    .withMessage('Role must be either user or worker')
];

// User login validation
exports.validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// OTP validation
exports.validateOTP = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number')
];

// Password reset validation
exports.validatePasswordReset = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Worker application validation
exports.validateWorkerApplication = [
  body('services')
    .isArray({ min: 1 })
    .withMessage('At least one service must be selected'),
  
  body('experience')
    .isIn(['0-1', '1-3', '3-5', '5-10', '10+'])
    .withMessage('Please select a valid experience range'),
  
  body('hourlyRate')
    .isFloat({ min: 10, max: 500 })
    .withMessage('Hourly rate must be between $10 and $500'),
  
  body('availability')
    .isArray({ min: 1 })
    .withMessage('At least one availability slot must be selected'),
  
  body('bio')
    .trim()
    .isLength({ min: 50, max: 500 })
    .withMessage('Bio must be between 50 and 500 characters')
];

// Booking creation validation
exports.validateBooking = [
  body('serviceId')
    .isMongoId()
    .withMessage('Valid service ID is required'),
  
  body('workerId')
    .isMongoId()
    .withMessage('Valid worker ID is required'),
  
  body('scheduledDate')
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value < new Date()) {
        throw new Error('Scheduled date cannot be in the past');
      }
      return true;
    }),
  
  body('scheduledTime.start')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  
  body('scheduledTime.end')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format')
    .custom((value, { req }) => {
      if (value <= req.body.scheduledTime.start) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  
  body('location.address')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Address must be at least 10 characters long'),
  
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]'),
  
  body('guestInfo.name')
    .if(body('guestInfo').exists())
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Guest name must be between 2 and 50 characters'),
  
  body('guestInfo.email')
    .if(body('guestInfo').exists())
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid guest email is required'),
  
  body('guestInfo.phone')
    .if(body('guestInfo').exists())
    .isMobilePhone()
    .withMessage('Valid guest phone number is required')
];

// Review validation
exports.validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
];

// Service validation
exports.validateService = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Service name must be between 2 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('category')
    .isIn(['cleaning', 'plumbing', 'electrical', 'gardening', 'cooking', 'handyman', 'painting', 'automotive', 'petcare', 'eldercare'])
    .withMessage('Please select a valid category'),
  
  body('basePrice.min')
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  body('basePrice.max')
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number')
    .custom((value, { req }) => {
      if (value < req.body.basePrice.min) {
        throw new Error('Maximum price must be greater than minimum price');
      }
      return true;
    }),
  
  body('duration.min')
    .isInt({ min: 30 })
    .withMessage('Minimum duration must be at least 30 minutes'),
  
  body('duration.max')
    .isInt({ min: 30 })
    .withMessage('Maximum duration must be at least 30 minutes')
    .custom((value, { req }) => {
      if (value < req.body.duration.min) {
        throw new Error('Maximum duration must be greater than minimum duration');
      }
      return true;
    })
];

// Profile update validation
exports.validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('address.street')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Street address must be between 5 and 100 characters'),
  
  body('address.city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  
  body('address.state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  
  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('Zip code must be between 5 and 10 characters'),
  
  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]')
];

// Pagination validation
exports.validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// MongoDB ObjectId validation
exports.validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

// Status update validation
exports.validateStatusUpdate = [
  body('status')
    .isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status value'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];



const validateWorkerApplication = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('services').isArray({ min: 1 }).withMessage('At least one service is required'),
  body('experience').isIn(['0-1', '1-3', '3-5', '5-10', '10+']).withMessage('Valid experience level is required'),
  body('hourlyRate').isFloat({ min: 10, max: 200 }).withMessage('Hourly rate must be between $10 and $200'),
  body('availability').isArray({ min: 1 }).withMessage('At least one availability slot is required'),
  body('bio').trim().isLength({ min: 50, max: 500 }).withMessage('Bio must be between 50 and 500 characters'),
  body('hasConvictions').isBoolean().withMessage('hasConvictions must be a boolean'),
  body('convictionDetails').if(body('hasConvictions').equals(true)).trim().notEmpty().withMessage('Conviction details are required if hasConvictions is true'),
];
