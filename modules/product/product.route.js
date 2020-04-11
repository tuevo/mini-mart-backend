const express = require('express');
const router = express.Router({});
const checkTokenMiddleware = require('../../middlewares/check-token.middleware');
const checkImporterMiddleware = require('../../middlewares/check-importer-role.middleware');
const ProductController = require('./product.controller');

router.get('/', checkTokenMiddleware, ProductController.getProducts);
router.post('/', checkTokenMiddleware, ProductController.addProduct);
router.put('/:productID', checkTokenMiddleware, checkImporterMiddleware, ProductController.updateProduct);
router.delete('/:productID', checkTokenMiddleware, checkImporterMiddleware, ProductController.removeProduct);

module.exports = router;
