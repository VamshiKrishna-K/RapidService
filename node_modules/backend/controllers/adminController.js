const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalBookings = await Booking.countDocuments();
    
    const revenueData = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    console.log(`Admin Stats Requested: ${totalUsers} Users, ${totalProviders} Providers, ${totalBookings} Bookings, ₹${totalRevenue} Revenue`);

    // Last 7 days booking trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          bookings: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Service category distribution
    const categoryStats = await Service.aggregate([
      { $group: { _id: "$category", value: { $sum: 1 } } }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalProviders,
        totalBookings,
        totalRevenue
      },
      dailyBookings,
      categoryStats: categoryStats.map(c => ({ name: c._id, value: c.value }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    console.log(`Admin: Retrieved ${users.length} users`);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all providers
// @route   GET /api/admin/providers
// @access  Private/Admin
const getAllProviders = async (req, res) => {
  try {
    const providers = await User.find({ role: 'provider' }).select('-password');
    console.log(`Admin: Retrieved ${providers.length} providers`);
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .populate('service', 'title')
      .sort('-createdAt')
      .limit(50);
    console.log(`Admin: Retrieved ${bookings.length} bookings`);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllProviders,
  getAllBookings
};
