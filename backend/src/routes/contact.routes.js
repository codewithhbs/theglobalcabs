const router = require('express').Router();
const ctrl = require('../controllers/contact.controller');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/', ctrl.createInquiry);

router.use(protect, restrictTo('admin'));
router.get('/', ctrl.getAllInquiries);
router.route('/:id').patch(ctrl.updateInquiry).delete(ctrl.deleteInquiry);

module.exports = router;
