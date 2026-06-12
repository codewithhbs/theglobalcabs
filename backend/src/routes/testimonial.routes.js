const router = require('express').Router();
const ctrl = require('../controllers/testimonial.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { upload, setFolder } = require('../middleware/upload');

router.get('/', ctrl.getAllTestimonials);

router.use(protect, restrictTo('admin'));
router.post('/', setFolder('testimonials'), upload.single('avatar'), ctrl.uploadAvatar, ctrl.createTestimonial);
router.route('/:id')
  .get(ctrl.getTestimonial)
  .patch(setFolder('testimonials'), upload.single('avatar'), ctrl.uploadAvatar, ctrl.updateTestimonial)
  .delete(ctrl.deleteTestimonial);

module.exports = router;
