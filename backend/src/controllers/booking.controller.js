const Booking = require('../models/Booking');
const Route = require('../models/Route');
const Vehicle = require('../models/Vehicle');
const FareRule = require('../models/FareRule');
const Coupon = require('../models/Coupon');
const Settings = require('../models/Settings');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { calculateFare } = require('../utils/fareEngine');
const { sendEmail, bookingEmailBody } = require('../utils/sendEmail');
const sendSms = require('../utils/sendSms');
const generateInvoice = require('../utils/invoice');
const User = require('../models/User');

const notify = async (booking, subjectPrefix) => {
  const email = booking.customer?.email || booking.guestDetails?.email;
  const phone = booking.customer?.phone || booking.guestDetails?.phone;
  const name = booking.customer?.name || booking.guestDetails?.name || 'Customer';
  if (email) {
    sendEmail({
      to: email,
      subject: `${subjectPrefix} - Booking #${booking.bookingId}`,
      title: `Hi ${name},`,
      html: bookingEmailBody(booking),
    });
  }
  if (phone) {
    sendSms(phone, `Global Cabs: Booking #${booking.bookingId} ${booking.status}. ${booking.pickupLocation} -> ${booking.dropLocation} on ${new Date(booking.pickupDate).toDateString()} ${booking.pickupTime}. Fare Rs.${booking.fare.total}. Help: ${process.env.COMPANY_PHONE}`);
  }
};

// POST /api/v1/bookings  (guest or logged-in)
exports.createBooking = catchAsync(async (req, res, next) => {
  const {
    routeId, vehicleId, tripType, pickupLocation, dropLocation,
    pickupDate, pickupTime, returnDate, passengers, distanceKm,
    couponCode, notes, guestDetails,
  } = req.body;

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle || vehicle.status !== 'active') return next(new AppError('Selected vehicle is unavailable', 400));
  if (!req.user && !(guestDetails?.name && guestDetails?.phone)) {
    return next(new AppError('Guest bookings require name and phone', 400));
  }

  // ─── Auto-create guest user ───────────────────────────────────────────────
  let bookingCustomer = req.user || null;
  let guestCredentials = null; // send to frontend

  if (!req.user && guestDetails?.phone) {
    let existingUser = await User.findOne({ phone: guestDetails.phone });

    if (!existingUser) {
      const rawPassword = guestDetails.phone; // default password = phone number
      const tempEmail = guestDetails.email || `${guestDetails.phone}@guest.local`;

      existingUser = await User.create({
        name: guestDetails.name,
        phone: guestDetails.phone,
        email: tempEmail,
        password: rawPassword,
        role: 'customer',
      });

      guestCredentials = {
        email: tempEmail,
        password: rawPassword, // plain — sirf notify ke liye
        isNewAccount: true,
      };
    } else {
      // user pehle se hai, sirf booking link karo
      guestCredentials = { isNewAccount: false };
    }

    bookingCustomer = existingUser;
  }

  // ─── Route & fare logic (unchanged) ──────────────────────────────────────
  let km = Number(distanceKm) || 0;
  let fareRule = null;
  let route = null;
  if (routeId) {
    route = await Route.findById(routeId);
    if (!route || route.status !== 'active') return next(new AppError('Route not available', 400));
    km = route.distanceKm;
    fareRule = await FareRule.findOne({ route: routeId, vehicle: vehicleId, status: 'active' });
  }

  let coupon = null;
  let couponDoc = null;
  if (couponCode) {
    couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (couponDoc && couponDoc.isValidNow())
      coupon = { type: couponDoc.type, value: couponDoc.value, code: couponDoc.code };
  }

  const fare = await calculateFare({ fareRule, vehicle, distanceKm: km, date: pickupDate, time: pickupTime, tripType, coupon });

  // ─── Create booking ───────────────────────────────────────────────────────
  const booking = await Booking.create({
    customer: bookingCustomer?._id,       // 👈 guest user ki id bhi save hogi
    guestDetails: req.user ? undefined : guestDetails,
    route: route?._id,
    vehicle: vehicle._id,
    tripType,
    pickupLocation: pickupLocation || route?.pickupLocation,
    dropLocation: dropLocation || route?.dropLocation,
    pickupDate, pickupTime, returnDate,
    passengers, distanceKm: km,
    fare, couponCode: coupon?.code, notes,
    statusHistory: [{ status: 'pending', by: req.user ? 'customer' : 'guest' }],
  });

  if (couponDoc && coupon) await Coupon.updateOne({ _id: couponDoc._id }, { $inc: { usedCount: 1 } });

  // ─── Notify ───────────────────────────────────────────────────────────────
  const populated = await booking.populate('customer vehicle route');
  notify(populated, 'Booking Received');

  // New guest account notify
  if (guestCredentials?.isNewAccount) {
    const msg = `Welcome to The Global Cabs! Your account has been created.\nLogin: ${guestCredentials.email}\nPassword: ${guestCredentials.password}\nPlease change your password after login.`;
    // SMS
    // await sendSMS(guestDetails.phone, msg);
    // Email (agar real email hai)
    if (guestDetails.email) {
      // await sendEmail({ to: guestDetails.email, subject: 'Your account details', text: msg });
    }
  }

  res.status(201).json({
    status: 'success',
    data: populated,
    // 👇 frontend ko bhejo
    guestAccount: guestCredentials?.isNewAccount
      ? {
        created: true,
        email: guestCredentials.email,
        password: guestCredentials.password,
        message: 'Your account has been created. Login with your phone number as password and please change it after login.',
      }
      : null,
  });
});

// Customer: my bookings
exports.getMyBookings = catchAsync(async (req, res) => {
  const filter = { customer: req.user._id };
  if (req.query.upcoming === 'true') {
    filter.pickupDate = { $gte: new Date() };
    filter.status = { $in: ['pending', 'confirmed'] };
  }
  const bookings = await Booking.find(filter).sort('-createdAt').populate('vehicle route driver');
  res.json({ status: 'success', results: bookings.length, data: bookings });
});

// Customer: cancel own booking
exports.cancelMyBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findOne({ _id: req.params.id, customer: req.user._id }).populate('customer vehicle');
  if (!booking) return next(new AppError('Booking not found', 404));
  if (['completed', 'cancelled', 'ongoing'].includes(booking.status)) {
    return next(new AppError(`Booking cannot be cancelled while ${booking.status}`, 400));
  }
  const settings = await Settings.findOne();
  const windowHrs = settings?.cancellationWindowHours ?? 4;
  const pickupAt = new Date(`${new Date(booking.pickupDate).toDateString()} ${booking.pickupTime}`);
  if (pickupAt - Date.now() < windowHrs * 3600 * 1000) {
    return next(new AppError(`Cancellations must be made at least ${windowHrs} hours before pickup`, 400));
  }
  booking.status = 'cancelled';
  booking.cancellation = { reason: req.body.reason || 'Cancelled by customer', cancelledAt: new Date(), cancelledBy: 'customer' };
  booking.statusHistory.push({ status: 'cancelled', by: 'customer' });
  await booking.save();
  notify(booking, 'Booking Cancelled');
  res.json({ status: 'success', data: booking });
});

// Invoice PDF (customer or admin)
exports.downloadInvoice = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).populate('customer vehicle route');
  if (!booking) return next(new AppError('Booking not found', 404));
  const isOwner = booking.customer && req.user && booking.customer._id.equals(req.user._id);
  if (!isOwner && req.user.role !== 'admin') return next(new AppError('Not authorized', 403));
  generateInvoice(booking, res);
});

// ---- Admin ----
exports.getAllBookings = factory.getAll(Booking, {
  searchFields: ['bookingId', 'pickupLocation', 'dropLocation'],
  populate: 'customer vehicle driver route',
});
exports.getBooking = factory.getOne(Booking, { populate: 'customer vehicle driver route' });
exports.deleteBooking = factory.deleteOne(Booking);

// Admin: status / assignment update with notifications
exports.updateBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).populate('customer vehicle driver route');
  if (!booking) return next(new AppError('Booking not found', 404));

  const prevStatus = booking.status;
  const allowed = ['status', 'driver', 'vehicle', 'notes', 'payment', 'pickupDate', 'pickupTime'];
  allowed.forEach((k) => { if (req.body[k] !== undefined) booking[k] = req.body[k]; });

  if (req.body.status && req.body.status !== prevStatus) {
    booking.statusHistory.push({ status: req.body.status, by: 'admin' });
    if (req.body.status === 'cancelled') {
      booking.cancellation = { reason: req.body.reason || 'Cancelled by admin', cancelledAt: new Date(), cancelledBy: 'admin' };
    }
  }
  await booking.save();
  const populated = await booking.populate('customer vehicle driver route');
  if (req.body.status && req.body.status !== prevStatus) notify(populated, 'Booking Update');
  res.json({ status: 'success', data: populated });
});

// Admin: CSV export
exports.exportBookings = catchAsync(async (req, res) => {
  const bookings = await Booking.find().sort('-createdAt').populate('customer vehicle driver');
  const rows = [
    ['BookingID', 'Date', 'Customer', 'Phone', 'Trip', 'Pickup', 'Drop', 'Vehicle', 'Driver', 'Status', 'Total'],
    ...bookings.map((b) => [
      b.bookingId,
      new Date(b.pickupDate).toISOString().slice(0, 10),
      b.customer?.name || b.guestDetails?.name || '',
      b.customer?.phone || b.guestDetails?.phone || '',
      b.tripType, b.pickupLocation, b.dropLocation,
      b.vehicle?.name || '', b.driver?.name || '',
      b.status, b.fare?.total ?? '',
    ]),
  ];
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=bookings-export.csv');
  res.send(csv);
});
