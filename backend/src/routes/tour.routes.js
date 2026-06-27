const router = require('express').Router();
const ctrl = require('../controllers/tour.controller');
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');
const { upload, setFolder } = require('../middleware/upload');

/* -------------------- Public reads -------------------- */
router.get('/', ctrl.getAllTours);
router.post('/price', ctrl.getTourPrice);              // live price for selected tour+vehicle
router.post('/bookings', optionalAuth, ctrl.createTourBooking); // guest or logged-in booking

// Customer (must come before /:id so they aren't swallowed by the param route)
router.get('/bookings/my', protect, ctrl.getMyTourBookings);
router.patch('/bookings/my/:id/cancel', protect, ctrl.cancelMyTourBooking);

/* -------------------- Admin bookings ------------------ */
router.get('/bookings/export/csv', protect, restrictTo('admin'), ctrl.exportTourBookings);
router.get('/bookings', protect, restrictTo('admin'), ctrl.getAllTourBookings);
router
  .route('/bookings/:id')
  .get(protect, restrictTo('admin'), ctrl.getTourBooking)
  .patch(protect, restrictTo('admin'), ctrl.updateTourBooking)
  .delete(protect, restrictTo('admin'), ctrl.deleteTourBooking);

/* -------------------- Tour detail (must be last among GETs) -------------------- */
router.get('/:id', ctrl.getTour);

/* -------------------- Admin tour CRUD ----------------- */
router.use(protect, restrictTo('admin'));
router.post('/', setFolder('tours'), upload.single('image'), ctrl.uploadTourImage, ctrl.createTour);
router
  .route('/:id')
  .patch(setFolder('tours'), upload.single('image'), ctrl.uploadTourImage, ctrl.updateTour)
  .delete(ctrl.deleteTour);

module.exports = router;
