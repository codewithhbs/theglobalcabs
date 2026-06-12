const router = require('express').Router();
const ctrl = require('../controllers/driver.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { upload, setFolder } = require('../middleware/upload');

router.use(protect, restrictTo('admin'));
const files = upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'documents', maxCount: 5 }]);

router.route('/')
  .get(ctrl.getAllDrivers)
  .post(setFolder('drivers'), files, ctrl.uploadDriverFiles, ctrl.createDriver);
router.route('/:id')
  .get(ctrl.getDriver)
  .patch(setFolder('drivers'), files, ctrl.uploadDriverFiles, ctrl.updateDriver)
  .delete(ctrl.deleteDriver);

module.exports = router;
