const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { upload, setFolder } = require('../middleware/upload');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);
router.get('/me', protect, ctrl.getMe);
router.patch('/me', protect, setFolder('avatars'), upload.single('avatar'), ctrl.updateMe);
router.patch('/update-password', protect, ctrl.updatePassword);

module.exports = router;
