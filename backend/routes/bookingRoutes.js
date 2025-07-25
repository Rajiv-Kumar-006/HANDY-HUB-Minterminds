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
const { validateObjectId } = require("../middleware/validation");

// Worker-specific bookings
router.get("/worker", protect, authorize("worker"), async (req, res, next) => {
  try {
    const bookings = await require("../models/Booking")
      .find({ worker: req.user._id })
      .populate("service", "title provider")
      .populate("customer.user", "name email")
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings.map((booking) => ({
        id: booking._id,
        service: booking.service.title,
        customer: booking.customer.user
          ? booking.customer.user.name
          : booking.customer.guestInfo.name,
        date: booking.scheduledDate,
        time: booking.scheduledTime.start,
        status: booking.status,
        amount: booking.pricing.totalAmount,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Booking routes
router.post("/", optionalAuth, createBooking);
router.get("/", protect, authorize("admin"), getAllBookings);
router.get("/me", protect, getUserBookings);
router.put("/:id/cancel", protect, validateObjectId("id"), cancelBooking);
router.post("/:id/review", protect, validateObjectId("id"), submitReview);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  validateObjectId("id"),
  updateBooking
);

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const {
//   createBooking,
//   getUserBookings,
//   getAllBookings,
//   cancelBooking,
//   submitReview,
//   updateBooking,
// } = require("../controllers/bookingController");
// const { protect, authorize, optionalAuth } = require("../middleware/auth");
// const { validateObjectId } = require("../middleware/validation");

// // Worker bookings route
// router.get("/worker", protect, authorize("worker"), async (req, res, next) => {
//   try {
//     const bookings = await require("../models/Booking")
//       .find({ worker: req.user._id })
//       .populate("service", "title provider")
//       .populate("customer.user", "name email")
//       .sort({ scheduledDate: -1 });

//     res.status(200).json({
//       success: true,
//       count: bookings.length,
//       data: bookings.map((booking) => ({
//         id: booking._id,
//         service: booking.service.title,
//         customer: booking.customer.user
//           ? booking.customer.user.name
//           : booking.customer.guestInfo.name,
//         date: booking.scheduledDate,
//         time: booking.scheduledTime.start,
//         status: booking.status,
//         amount: booking.pricing.totalAmount,
//       })),
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// // Booking routes
// router .route("/").post(optionalAuth, createBooking).get(protect, authorize("admin"), getAllBookings);

// router.route("/me").get(protect, getUserBookings);

// router.route("/:id/cancel").put(protect, validateObjectId("id"), cancelBooking);

// router.route("/:id/review").post(protect, validateObjectId("id"), submitReview);

// router
//   .route("/:id")
//   .put(protect, authorize("admin"), validateObjectId("id"), updateBooking);

// module.exports = router;
