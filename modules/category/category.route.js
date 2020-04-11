const express = require('express');
const router = express.Router({});
const checkTokenMiddleware = require('../../middlewares/check-token.middleware');
const checkImporterRoleMiddleware = require('../../middlewares/check-importer-role.middleware');
const CategoryController = require('./category.controller');

router.get('/', checkTokenMiddleware, checkImporterRoleMiddleware, CategoryController.getCategories);
router.get('/:categoryID/products', checkTokenMiddleware, checkImporterRoleMiddleware, CategoryController.getCategoryProducts);
router.post('/', checkTokenMiddleware, checkImporterRoleMiddleware, CategoryController.addCategory);
router.put('/:categoryID', checkTokenMiddleware, checkImporterRoleMiddleware, CategoryController.updateCategory);
router.delete('/:categoryID', checkTokenMiddleware, checkImporterRoleMiddleware, CategoryController.removeCategory);

module.exports = router;