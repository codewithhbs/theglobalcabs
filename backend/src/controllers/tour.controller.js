const Tour = require('../models/Tour');
const TourBooking = require('../models/TourBooking');
const Vehicle = require('../models/Vehicle');
const Settings = require('../models/Settings');
const User = require('../models/User');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendEmail, bookingEmailBody } = require('../utils/sendEmail');
const sendSms = require('../utils/sendSms');

/* -------------------------- Public: Tour read ---------------------------- */

// GET /api/v1/tours        -> list (with filters via APIFeatures)
exports.getAllTours = factory.getAll(Tour, {
  searchFields: ['title', 'fromLocation', 'toLocation', 'category'],
  populate: { path: 'vehiclePricing.vehicle', select: 'name slug category seatingCapacity images perKmRate' },
});

// GET /api/v1/tours/:id  -> single tour by id or slug (populated)
exports.getTour = catchAsync(async (req, res, next) => {
  const idOrSlug = req.params.id;
  const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? { _id: idOrSlug } : { slug: idOrSlug };
  const tour = await Tour.findOne(query).populate({
    path: 'vehiclePricing.vehicle',
    select: 'name slug category seatingCapacity luggageCapacity images features fuelType perKmRate description',
  });
  if (!tour) return next(new AppError('Tour not found', 404));
  res.json({ status: 'success', data: tour });
});

/* -------------------------- Admin: Tour CRUD ----------------------------- */

// Helper – parse vehiclePricing if it arrives as a JSON string (multipart form-data)
const parsePricingFromBody = (body) => {
  if (typeof body.vehiclePricing === 'string') {
    try { body.vehiclePricing = JSON.parse(body.vehiclePricing); } catch { body.vehiclePricing = []; }
  }
  if (Array.isArray(body.vehiclePricing)) {
    body.vehiclePricing = body.vehiclePricing
      .filter((p) => p && p.vehicle && p.price !== '' && p.price !== undefined)
      .map((p) => ({ vehicle: p.vehicle, price: Number(p.price) }));
  }
  // String fields that should actually be arrays
  ['highlights', 'includes', 'excludes'].forEach((k) => {
    if (typeof body[k] === 'string') {
      try {
        const parsed = JSON.parse(body[k]);
        if (Array.isArray(parsed)) body[k] = parsed;
        else body[k] = body[k].split(',').map((s) => s.trim()).filter(Boolean);
      } catch {
        body[k] = body[k].split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
  });
  if (typeof body.itinerary === 'string') {
    try { body.itinerary = JSON.parse(body.itinerary); } catch { body.itinerary = []; }
  }
  if (typeof body.seo === 'string') {
    try { body.seo = JSON.parse(body.seo); } catch {}
  }
  return body;
};

exports.uploadTourImage = (req, res, next) => {
  if (req.file) req.body.image = { url: req.file.path, publicId: req.file.filename };
  next();
};

exports.createTour = catchAsync(async (req, res) => {
  const body = parsePricingFromBody(req.body);
  const doc = await Tour.create(body);
  res.status(201).json({ status: 'success', data: doc });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const body = parsePricingFromBody(req.body);
  // Use save() instead of findByIdAndUpdate so the pre-validate hook
  // (slug + startingPrice recomputation) actually fires on updates too.
  const doc = await Tour.findById(req.params.id);
  if (!doc) return next(new AppError('Tour not found', 404));
  Object.assign(doc, body);
  await doc.save();
  res.json({ status: 'success', data: doc });
});

exports.deleteTour = factory.deleteOne(Tour);

/* -------------------- Public: get price for a tour+vehicle --------------- */

// POST /api/v1/tours/price  { tourId, vehicleId, travellers? }
// Returns the fare breakdown so the booking form can show live pricing.
exports.getTourPrice = catchAsync(async (req, res, next) => {
  const { tourId, vehicleId } = req.body;
  if (!tourId || !vehicleId) return next(new AppError('tourId and vehicleId are required', 400));

  const tour = await Tour.findById(tourId);
  if (!tour || tour.status !== 'active') return next(new AppError('Tour not available', 400));

  const pricing = (tour.vehiclePricing || []).find((p) => String(p.vehicle) === String(vehicleId));
  if (!pricing) return next(new AppError('This vehicle is not available for the selected tour', 400));

  const settings = (await Settings.findOne().lean()) || {};
  const taxPercent = settings.taxPercent ?? 5;
  const base = Number(pricing.price) || 0;
  const tax = Math.round((base * taxPercent) / 100);
  const total = base + tax;

  res.json({
    status: 'success',
    data: {
      tourId, vehicleId,
      fare: {
        base,
        tax,
        taxPercent,
        total,
        breakdown: [
          { label: 'Tour package fare', amount: base },
          { label: `Tax / GST (${taxPercent}%)`, amount: tax },
        ],
      },
    },
  });
});

/* -------------------- Booking: create (public/guest) --------------------- */

const notify = async (booking, subjectPrefix) => {
  const email = booking.customer?.email || booking.guestDetails?.email;
  const phone = booking.customer?.phone || booking.guestDetails?.phone;
  const name = booking.customer?.name || booking.guestDetails?.name || 'Customer';
  if (email) {
    sendEmail({
      to: email,
      subject: `${subjectPrefix} - Tour Booking #${booking.bookingId}`,
      title: `Hi ${name},`,
      html: bookingEmailBody({
        bookingId: booking.bookingId,
        status: booking.status || 'pending',          // template calls .toUpperCase() on this
        tripType: 'Tour Package',                       // template renders this verbatim
        pickupLocation: booking.pickupLocation,
        dropLocation: booking.tour?.title,
        pickupDate: booking.travelDate,
        pickupTime: '',
        vehicle: booking.vehicle,
        fare: booking.fare,
      }),
    });
  }
  if (phone) {
    sendSms(
      phone,
      `Global Cabs: Tour Booking #${booking.bookingId} ${booking.status}. ${booking.tour?.title || ''} on ${new Date(booking.travelDate).toDateString()}. Total Rs.${booking.fare.total}. Help: ${process.env.COMPANY_PHONE || ''}`
    );
  }
};

// POST /api/v1/tours/bookings   (guest or logged-in)
exports.createTourBooking = catchAsync(async (req, res, next) => {
  const { tourId, vehicleId, travelDate, pickupLocation, travellers, notes, guestDetails } = req.body;

  const tour = await Tour.findById(tourId);
  if (!tour || tour.status !== 'active') return next(new AppError('Tour not available', 400));

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle || vehicle.status !== 'active') return next(new AppError('Selected vehicle is unavailable', 400));

  const pricing = (tour.vehiclePricing || []).find((p) => String(p.vehicle) === String(vehicleId));
  if (!pricing) return next(new AppError('This vehicle is not available for the selected tour', 400));

  if (!req.user && !(guestDetails?.name && guestDetails?.phone)) {
    return next(new AppError('Guest bookings require name and phone', 400));
  }

  // Auto-create guest user (same UX as cab bookings)
  let bookingCustomer = req.user || null;
  let guestCredentials = null;

  if (!req.user && guestDetails?.phone) {
    const tempEmail = (guestDetails.email || `${guestDetails.phone}@guest.local`).toLowerCase();

    // A user is "existing" if EITHER their phone OR their email already matches.
    // email is the unique-indexed field on User, so checking phone alone is not enough.
    let existingUser = await User.findOne({
      $or: [{ phone: guestDetails.phone }, { email: tempEmail }],
    });

    if (!existingUser) {
      const rawPassword = guestDetails.phone;
      try {
        existingUser = await User.create({
          name: guestDetails.name,
          phone: guestDetails.phone,
          email: tempEmail,
          password: rawPassword,
          role: 'customer',
        });
        guestCredentials = { email: tempEmail, password: rawPassword, isNewAccount: true };
      } catch (err) {
        // Race condition: a parallel request created the user between findOne and create.
        // Mongo unique-index violation -> re-fetch and reuse instead of failing the booking.
        if (err && err.code === 11000) {
          existingUser = await User.findOne({
            $or: [{ phone: guestDetails.phone }, { email: tempEmail }],
          });
          if (!existingUser) throw err;
          guestCredentials = { isNewAccount: false };
        } else {
          throw err;
        }
      }
    } else {
      guestCredentials = { isNewAccount: false };
    }
    bookingCustomer = existingUser;
  }

  // Recompute fare server-side (NEVER trust client price)
  const settings = (await Settings.findOne().lean()) || {};
  const taxPercent = settings.taxPercent ?? 5;
  const base = Number(pricing.price) || 0;
  const tax = Math.round((base * taxPercent) / 100);
  const total = base + tax;

  const booking = await TourBooking.create({
    tour: tour._id,
    vehicle: vehicle._id,
    customer: bookingCustomer?._id,
    guestDetails: req.user ? undefined : guestDetails,
    travelDate,
    pickupLocation: pickupLocation || tour.fromLocation,
    travellers: Number(travellers) || 1,
    price: base,
    fare: {
      base,
      tax,
      taxPercent,
      total,
      breakdown: [
        { label: 'Tour package fare', amount: base },
        { label: `Tax / GST (${taxPercent}%)`, amount: tax },
      ],
    },
    notes,
    statusHistory: [{ status: 'pending', by: req.user ? 'customer' : 'guest' }],
  });

  const populated = await booking.populate('customer vehicle tour driver');
  notify(populated, 'Booking Received');

  res.status(201).json({
    status: 'success',
    data: populated,
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

/* ----------------------- Booking: customer reads ------------------------- */

// GET /api/v1/tours/bookings/my
exports.getMyTourBookings = catchAsync(async (req, res) => {
  const filter = { customer: req.user._id };
  if (req.query.upcoming === 'true') {
    filter.travelDate = { $gte: new Date() };
    filter.status = { $in: ['pending', 'confirmed'] };
  }
  const bookings = await TourBooking.find(filter).sort('-createdAt').populate('vehicle tour driver');
  res.json({ status: 'success', results: bookings.length, data: bookings });
});

// PATCH /api/v1/tours/bookings/my/:id/cancel
exports.cancelMyTourBooking = catchAsync(async (req, res, next) => {
  const booking = await TourBooking.findOne({ _id: req.params.id, customer: req.user._id }).populate('customer vehicle tour driver');
  if (!booking) return next(new AppError('Booking not found', 404));
  if (['completed', 'cancelled', 'ongoing'].includes(booking.status)) {
    return next(new AppError(`Booking cannot be cancelled while ${booking.status}`, 400));
  }
  const settings = await Settings.findOne();
  const windowHrs = settings?.cancellationWindowHours ?? 24;
  const travelAt = new Date(booking.travelDate);
  if (travelAt - Date.now() < windowHrs * 3600 * 1000) {
    return next(new AppError(`Cancellations must be made at least ${windowHrs} hours before travel date`, 400));
  }
  booking.status = 'cancelled';
  booking.cancellation = { reason: req.body.reason || 'Cancelled by customer', cancelledAt: new Date(), cancelledBy: 'customer' };
  booking.statusHistory.push({ status: 'cancelled', by: 'customer' });
  await booking.save();
  notify(booking, 'Booking Cancelled');
  res.json({ status: 'success', data: booking });
});

/* ------------------------- Booking: admin -------------------------------- */

exports.getAllTourBookings = factory.getAll(TourBooking, {
  searchFields: ['bookingId', 'pickupLocation'],
  populate: 'customer vehicle tour driver',
});

exports.getTourBooking = factory.getOne(TourBooking, { populate: 'customer vehicle tour driver' });
exports.deleteTourBooking = factory.deleteOne(TourBooking);

exports.updateTourBooking = catchAsync(async (req, res, next) => {
  const booking = await TourBooking.findById(req.params.id).populate('customer vehicle tour driver');
  if (!booking) return next(new AppError('Booking not found', 404));

  const prevStatus = booking.status;
  const allowed = ['status', 'vehicle', 'driver', 'notes', 'payment', 'travelDate', 'pickupLocation'];
  allowed.forEach((k) => { if (req.body[k] !== undefined) booking[k] = req.body[k]; });

  if (req.body.status && req.body.status !== prevStatus) {
    booking.statusHistory.push({ status: req.body.status, by: 'admin' });
    if (req.body.status === 'cancelled') {
      booking.cancellation = { reason: req.body.reason || 'Cancelled by admin', cancelledAt: new Date(), cancelledBy: 'admin' };
    }
  }
  await booking.save();
  const populated = await booking.populate('customer vehicle tour driver');
  if (req.body.status && req.body.status !== prevStatus) notify(populated, 'Booking Update');
  res.json({ status: 'success', data: populated });
});

// CSV export
exports.exportTourBookings = catchAsync(async (req, res) => {
  const bookings = await TourBooking.find().sort('-createdAt').populate('customer vehicle tour driver');
  const rows = [
    ['BookingID', 'Created', 'Customer', 'Phone', 'Tour', 'Travel Date', 'Pickup', 'Vehicle', 'Driver', 'Travellers', 'Status', 'Total'],
    ...bookings.map((b) => [
      b.bookingId,
      new Date(b.createdAt).toISOString().slice(0, 10),
      b.customer?.name || b.guestDetails?.name || '',
      b.customer?.phone || b.guestDetails?.phone || '',
      b.tour?.title || '',
      new Date(b.travelDate).toISOString().slice(0, 10),
      b.pickupLocation,
      b.vehicle?.name || '',
      b.driver?.name || '',
      b.travellers,
      b.status,
      b.fare?.total ?? '',
    ]),
  ];
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=tour-bookings-export.csv');
  res.send(csv);
});