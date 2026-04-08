const express = require('express');
const router = express.Router();
const { getServices, createService, deleteService } = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getServices)
  .post(protect, authorize('provider', 'admin'), createService);

router.route('/:id')
  .delete(protect, authorize('provider', 'admin'), deleteService);

module.exports = router;
