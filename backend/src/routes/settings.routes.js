const router = require('express').Router();
const ctrl = require('../controllers/settings.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { upload, setFolder } = require('../middleware/upload');

router.get('/', ctrl.getSettings); // public (site config for frontend)
router.patch('/', protect, restrictTo('admin'), setFolder('settings'), upload.single('logo'), ctrl.updateSettings);

module.exports = router;
