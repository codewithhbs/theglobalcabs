const Booking = require('../models/Booking');
const Route = require('../models/Route');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

exports.getStats = catchAsync(async (req, res) => {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [
    totalBookings, monthBookings, pendingBookings,
    activeRoutes, activeDrivers, totalVehicles, totalCustomers,
    revenueAgg, recentBookings, statusCounts, last6Months,
  ] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Booking.countDocuments({ status: 'pending' }),
    Route.countDocuments({ status: 'active' }),
    Driver.countDocuments({ status: 'active' }),
    Vehicle.countDocuments({ status: 'active' }),
    User.countDocuments({ role: 'customer' }),
    Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'ongoing', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$fare.total' } } },
    ]),
    Booking.find().sort('-createdAt').limit(8).populate('customer vehicle'),
    Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Booking.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 183 * 24 * 3600 * 1000) } } },
      {
        $group: {
          _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
          bookings: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $ne: ['$status', 'cancelled'] }, '$fare.total', 0] } },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]),
  ]);

  res.json({
    status: 'success',
    data: {
      totals: {
        bookings: totalBookings,
        monthBookings,
        pendingBookings,
        revenue: revenueAgg[0]?.total || 0,
        activeRoutes, activeDrivers, vehicles: totalVehicles, customers: totalCustomers,
      },
      recentBookings,
      statusCounts: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
      monthly: last6Months.map((m) => ({ month: `${m._id.m}/${m._id.y}`, bookings: m.bookings, revenue: m.revenue })),
    },
  });
});
