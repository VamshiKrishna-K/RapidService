const Booking = require('../models/Booking');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// @desc    Create new booking and Razorpay order
// @route   POST /api/bookings
// @access  Private/User
exports.createBooking = async (req, res) => {
  try {
    const { providerId, serviceId, scheduleDate, totalAmount } = req.body;

    // Check for double booking conflicts
    const conflictingBooking = await Booking.findOne({
      provider: providerId,
      scheduleDate: new Date(scheduleDate),
      status: { $in: ['pending', 'accepted'] },
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'Time slot already booked' });
    }

    // 1. Create Razorpay order (with fallback for testing)
    let orderId = `order_mock_${Date.now()}`;
    let order = null;

    try {
      const options = {
        amount: totalAmount * 100,
        currency: 'INR',
        receipt: `receipt_order_${Date.now()}`,
      };
      order = await instance.orders.create(options);
      if (order && order.id) {
        orderId = order.id;
      }
    } catch (razorError) {
      console.warn("Razorpay order creation skipped/failed, using mock ID:", razorError.message);
    }

    // 2. Save booking in DB
    const booking = await Booking.create({
      customer: req.user._id,
      provider: providerId,
      service: serviceId,
      scheduleDate,
      totalAmount,
      razorpayOrderId: orderId,
      paymentStatus: 'pending' // Initialize as pending so user can pay later
    });

    res.status(201).json({
      success: true,
      booking,
      order: order || { id: orderId, amount: totalAmount * 100, currency: 'INR' },
    });
  } catch (error) {
    console.error("Booking create error:", error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

// @desc    Verify payment signature
// @route   POST /api/bookings/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, is_mock_payment, bookingId } = req.body;

    // Fast-path for the simulated checkout demonstration
    if (is_mock_payment && bookingId) {
       await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid' });
       return res.status(200).json({ message: 'Simulated payment verified successfully' });
    }

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment is successful, update booking status
      await Booking.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { paymentStatus: 'paid', razorpayPaymentId: razorpay_payment_id }
      );

      // Optionally emit a Socket.io event here
      // req.app.get('io').to(providerId).emit('paymentReceived', bookingDetails)

      return res.status(200).json({ message: 'Payment verified successfully' });
    } else {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Provider
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted', 'rejected', 'completed'
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.provider.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();

    // Emit Socket.io notification
    req.app.get('io').to(booking.customer.toString()).emit('bookingUpdated', {
      bookingId: booking._id,
      status: booking.status,
    });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user/provider bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'provider') {
      query.provider = req.user._id;
    } else {
      query.customer = req.user._id;
    }

    const bookings = await Booking.find(query)
      .populate('provider', 'name email address')
      .populate('customer', 'name email address')
      .populate('service', 'title category basePrice')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
