const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getAllProviders,
  getAllBookings
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes here require admin access
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/providers', getAllProviders);
router.get('/bookings', getAllBookings);

module.exports = router;
