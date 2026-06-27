const Booking = require('../models/Booking');
const TourBooking = require('../models/TourBooking');
const Route = require('../models/Route');
const Tour = require('../models/Tour');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

// Merge two arrays of { _id: status, count } into { status: count }
const mergeStatusCounts = (a, b) => {
  const out = {};
  [...a, ...b].forEach(({ _id, count }) => { out[_id] = (out[_id] || 0) + count; });
  return out;
};

// Merge two monthly aggregates [{ _id: { y, m }, bookings, revenue }, ...]
// into a single sorted array keyed by year/month.
const mergeMonthly = (a, b) => {
  const map = new Map();
  const add = (rows) => rows.forEach((r) => {
    const k = `${r._id.y}-${r._id.m}`;
    const prev = map.get(k) || { y: r._id.y, m: r._id.m, bookings: 0, revenue: 0 };
    prev.bookings += r.bookings;
    prev.revenue += r.revenue;
    map.set(k, prev);
  });
  add(a); add(b);
  return [...map.values()]
    .sort((x, y) => (x.y - y.y) || (x.m - y.m))
    .map((r) => ({ month: `${r.m}/${r.y}`, bookings: r.bookings, revenue: r.revenue }));
};

exports.getStats = catchAsync(async (req, res) => {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const halfYearAgo = new Date(Date.now() - 183 * 24 * 3600 * 1000);

  const revenueMatch = { status: { $in: ['confirmed', 'ongoing', 'completed'] } };
  const monthlyMatch = { createdAt: { $gte: halfYearAgo } };
  const monthlyGroup = {
    $group: {
      _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
      bookings: { $sum: 1 },
      revenue: { $sum: { $cond: [{ $ne: ['$status', 'cancelled'] }, '$fare.total', 0] } },
    },
  };

  const [
    // Cab bookings
    cabTotal, cabMonth, cabPending, cabRevenueAgg, cabRecent, cabStatusCounts, cabMonthly,
    // Tour bookings
    tourTotal, tourMonth, tourPending, tourRevenueAgg, tourRecent, tourStatusCounts, tourMonthly,
    // Other
    activeRoutes, activeTours, activeDrivers, totalVehicles, totalCustomers,
  ] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Booking.countDocuments({ status: 'pending' }),
    Booking.aggregate([{ $match: revenueMatch }, { $group: { _id: null, total: { $sum: '$fare.total' } } }]),
    Booking.find().sort('-createdAt').limit(8).populate('customer vehicle'),
    Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Booking.aggregate([{ $match: monthlyMatch }, monthlyGroup, { $sort: { '_id.y': 1, '_id.m': 1 } }]),

    TourBooking.countDocuments(),
    TourBooking.countDocuments({ createdAt: { $gte: startOfMonth } }),
    TourBooking.countDocuments({ status: 'pending' }),
    TourBooking.aggregate([{ $match: revenueMatch }, { $group: { _id: null, total: { $sum: '$fare.total' } } }]),
    TourBooking.find().sort('-createdAt').limit(8).populate('customer vehicle tour'),
    TourBooking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    TourBooking.aggregate([{ $match: monthlyMatch }, monthlyGroup, { $sort: { '_id.y': 1, '_id.m': 1 } }]),

    Route.countDocuments({ status: 'active' }),
    Tour.countDocuments({ status: 'active' }),
    Driver.countDocuments({ status: 'active' }),
    Vehicle.countDocuments({ status: 'active' }),
    User.countDocuments({ role: 'customer' }),
  ]);

  const cabRevenue = cabRevenueAgg[0]?.total || 0;
  const tourRevenue = tourRevenueAgg[0]?.total || 0;

  res.json({
    status: 'success',
    data: {
      totals: {
        // Combined numbers (existing UI keeps working — values now include tours)
        bookings: cabTotal + tourTotal,
        monthBookings: cabMonth + tourMonth,
        pendingBookings: cabPending + tourPending,
        revenue: cabRevenue + tourRevenue,
        // Per-kind split for any UI that wants to show it separately
        cabBookings: cabTotal,
        tourBookings: tourTotal,
        cabRevenue,
        tourRevenue,
        // Catalog / people
        activeRoutes,
        activeTours,
        activeDrivers,
        vehicles: totalVehicles,
        customers: totalCustomers,
      },
      recentBookings: cabRecent,            // cab bookings (unchanged shape)
      recentTourBookings: tourRecent,       // tour bookings (new)
      statusCounts: mergeStatusCounts(cabStatusCounts, tourStatusCounts),
      monthly: mergeMonthly(cabMonthly, tourMonthly),
    },
  });
});