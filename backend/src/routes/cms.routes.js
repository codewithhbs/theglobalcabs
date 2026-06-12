const router = require('express').Router();
const ctrl = require('../controllers/cms.controller');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/pages', ctrl.getAllPages);
router.get('/pages/:id', ctrl.getPage);

router.use(protect, restrictTo('admin'));
router.post('/pages', ctrl.createPage);
router.route('/pages/:id').patch(ctrl.updatePage).delete(ctrl.deletePage);

module.exports = router;
