const router = require('express').Router({});
const checkTokenMiddleware = require('../../middlewares/check-token.middleware');
const checkCashierRoleMiddleware = require('../../middlewares/check-cashier-role.middleware');
const CheckoutSessionController = require('./checkout-session.controller');

router.get('/', checkTokenMiddleware, checkCashierRoleMiddleware, CheckoutSessionController.getCheckoutSessions);
router.post('/', checkTokenMiddleware, checkCashierRoleMiddleware, CheckoutSessionController.createCheckoutSession);
router.put('/:checkoutSessionID', checkTokenMiddleware, checkCashierRoleMiddleware, CheckoutSessionController.submitCheckoutSession);
router.delete('/:checkoutSessionID', checkTokenMiddleware, checkCashierRoleMiddleware, CheckoutSessionController.cancelCheckoutSession);

module.exports = router;