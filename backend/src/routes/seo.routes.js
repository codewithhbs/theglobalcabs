const router = require('express').Router();
const ctrl = require('../controllers/seo.controller');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/resolve', ctrl.getByPath); // public for frontend metadata

router.use(protect, restrictTo('admin'));
router.route('/').get(ctrl.getAllSeo).post(ctrl.createSeo);
router.route('/:id').patch(ctrl.updateSeo).delete(ctrl.deleteSeo);

module.exports = router;
