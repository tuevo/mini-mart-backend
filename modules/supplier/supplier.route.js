const express = require('express');
const router = express.Router({});
const SupplierController = require('./supplier.controller');
const checkTokenMiddleware = require('../../middlewares/check-token.middleware');
const checkImporterRoleMiddleware = require('../../middlewares/check-importer-role.middleware');
const checkManagerRoleMiddleware = require('../../middlewares/check-manager-role.middleware');

router.get('/', checkTokenMiddleware, SupplierController.getSuppliers);
router.post('/', checkTokenMiddleware, checkManagerRoleMiddleware, SupplierController.addSupplier);
router.put('/:supplierID', checkTokenMiddleware, checkManagerRoleMiddleware, SupplierController.updateSupplier);
router.delete('/:supplierID', checkTokenMiddleware, checkManagerRoleMiddleware, SupplierController.removeSupplier);

module.exports = router;