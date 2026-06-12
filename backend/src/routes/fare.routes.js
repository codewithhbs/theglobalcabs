const router = require('express').Router();
const ctrl = require('../controllers/fare.controller');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/calculate', ctrl.calculate); // public fare calculator

router.use(protect, restrictTo('admin'));
router.route('/').get(ctrl.getAllFareRules).post(ctrl.createFareRule);
router.route('/coupons').get(ctrl.getAllCoupons).post(ctrl.createCoupon);
router.route('/coupons/:id').patch(ctrl.updateCoupon).delete(ctrl.deleteCoupon);
router.route('/:id').get(ctrl.getFareRule).patch(ctrl.updateFareRule).delete(ctrl.deleteFareRule);

module.exports = router;
