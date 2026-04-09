const express = require('express');
const router = express.Router();
const {
  createBooking,
  verifyPayment,
  updateBookingStatus,
  getBookings,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, authorize('user'), createBooking)
  .get(protect, getBookings);

router.post('/verify', protect, authorize('user'), verifyPayment);

router.route('/:id/status')
  .put(protect, authorize('provider', 'admin'), updateBookingStatus);

module.exports = router;
