const express = require("express");
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getAllBookings,
  cancelBooking,
  submitReview,
  updateBooking,
} = require("../controllers/bookingController");
const { protect, authorize, optionalAuth } = require("../middleware/auth");

router
  .route("/")
  .post(optionalAuth, createBooking)
  .get(protect, authorize("admin"), getAllBookings);

router.route("/me").get(protect, getUserBookings);

router.route("/:id/cancel").put(protect, cancelBooking);

router.route("/:id/review").post(protect, submitReview);

router.route("/:id").put(protect, authorize("admin"), updateBooking);

module.exports = router;



// const express = require('express');
// const {
//   createBooking,
//   getMyBookings,
//   getWorkerBookings,
//   getBooking,
//   updateBookingStatus,
//   addReview,
//   getBookingByCode
// } = require('../controllers/bookingController');
// const { protect, authorize, optionalAuth } = require('../middleware/auth');
// const {
//   validateBooking,
//   validateReview,
//   validateStatusUpdate,
//   validateObjectId,
//   validatePagination
// } = require('../middleware/validation');

// const router = express.Router();

// // Public routes
// router.get('/code/:code', getBookingByCode);

// // Routes that allow both authenticated and guest users
// router.post('/', optionalAuth, validateBooking, createBooking);

// // Protected routes
// router.get('/my-bookings', protect, validatePagination, getMyBookings);
// router.get('/worker-bookings', protect, authorize('worker'), validatePagination, getWorkerBookings);
// router.get('/:id', protect, validateObjectId, getBooking);
// router.put('/:id/status', protect, validateObjectId, validateStatusUpdate, updateBookingStatus);
// router.post('/:id/review', protect, authorize('user'), validateObjectId, validateReview, addReview);

// module.exports = router;
