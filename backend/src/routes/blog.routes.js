const router = require('express').Router();
const ctrl = require('../controllers/blog.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { upload, setFolder } = require('../middleware/upload');

router.get('/', ctrl.getAllBlogs);
router.get('/:id', ctrl.getBlog);

router.use(protect, restrictTo('admin'));
router.post('/', setFolder('blogs'), upload.single('coverImage'), ctrl.uploadCover, ctrl.createBlog);
router.route('/:id')
  .patch(setFolder('blogs'), upload.single('coverImage'), ctrl.uploadCover, ctrl.updateBlog)
  .delete(ctrl.deleteBlog);

module.exports = router;
