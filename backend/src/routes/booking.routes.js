const router = require('express').Router();
const ctrl = require('../controllers/booking.controller');
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, ctrl.createBooking);            // guest or logged-in
router.get('/my', protect, ctrl.getMyBookings);                // customer dashboard
router.patch('/my/:id/cancel', protect, ctrl.cancelMyBooking); // customer cancel
router.get('/:id/invoice', protect, ctrl.downloadInvoice);     // owner or admin

router.use(protect, restrictTo('admin'));
router.get('/export/csv', ctrl.exportBookings);
router.get('/', ctrl.getAllBookings);
router.route('/:id').get(ctrl.getBooking).patch(ctrl.updateBooking).delete(ctrl.deleteBooking);

module.exports = router;
