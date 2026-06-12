const router = require('express').Router();
const ctrl = require('../controllers/vehicle.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { upload, setFolder } = require('../middleware/upload');

router.get('/', ctrl.getAllVehicles);
router.get('/:id', ctrl.getVehicle);

router.use(protect, restrictTo('admin'));
router.post('/', setFolder('vehicles'), upload.array('images', 6), ctrl.uploadVehicleImages, ctrl.createVehicle);
router.route('/:id')
  .patch(setFolder('vehicles'), upload.array('images', 6), ctrl.uploadVehicleImages, ctrl.updateVehicle)
  .delete(ctrl.deleteVehicle);

module.exports = router;
