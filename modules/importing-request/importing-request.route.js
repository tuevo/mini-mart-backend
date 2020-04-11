const router = require('express').Router({});
const checkTokenMiddleware = require('../../middlewares/check-token.middleware');
const checkCashierRoleMiddleware = require('../../middlewares/check-cashier-role.middleware');
const checkManagerRoleMiddleware = require('../../middlewares/check-manager-role.middleware');
const importingRequestController = require('./importing-request.controller');

router.get('/', checkTokenMiddleware, checkManagerRoleMiddleware, importingRequestController.getImportingRequests);
router.post('/', checkTokenMiddleware, checkCashierRoleMiddleware, importingRequestController.createImportingRequest);

module.exports = router;