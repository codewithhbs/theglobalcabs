const router = require('express').Router();
const ctrl = require('../controllers/route.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { upload, setFolder } = require('../middleware/upload');

router.get('/', ctrl.getAllRoutes);
router.get('/detail/:slug', ctrl.getRouteWithFares);
router.get('/:id', ctrl.getRoute);

router.use(protect, restrictTo('admin'));
router.post('/', setFolder('routes'), upload.single('image'), ctrl.uploadRouteImage, ctrl.createRoute);
router.route('/:id')
  .patch(setFolder('routes'), upload.single('image'), ctrl.uploadRouteImage, ctrl.updateRoute)
  .delete(ctrl.deleteRoute);

module.exports = router;
