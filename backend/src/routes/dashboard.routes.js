const router = require('express').Router();
const ctrl = require('../controllers/dashboard.controller');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/stats', protect, restrictTo('admin'), ctrl.getStats);

module.exports = router;
