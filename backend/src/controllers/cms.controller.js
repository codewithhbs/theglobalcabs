const Page = require('../models/Page');
const factory = require('./handlerFactory');

exports.getAllPages = factory.getAll(Page, { searchFields: ['title', 'slug'] });
exports.getPage = factory.getOne(Page, { bySlug: true });
exports.createPage = factory.createOne(Page);
exports.updatePage = factory.updateOne(Page);
exports.deletePage = factory.deleteOne(Page);
