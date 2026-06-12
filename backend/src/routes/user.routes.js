const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('admin'));
router.route('/').get(ctrl.getAllUsers).post(ctrl.createUser);
router.route('/:id').get(ctrl.getUser).patch(ctrl.updateUser).delete(ctrl.deleteUser);

module.exports = router;
