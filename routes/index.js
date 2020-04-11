const express = require('express');
const router = express.Router({});

router.use('/users', require('../modules/user/user.route'));
router.use('/suppliers', require('../modules/supplier/supplier.route'));
router.use('/categories', require('../modules/category/category.route'));
router.use('/products', require('../modules/product/product.route'));
router.use('/work-schedules', require('../modules/work-schedule/work-schedule.route'));
router.use('/work-shifts', require('../modules/work-shift/work-shift.route'));
router.use('/work-assignments', require('../modules/work-assignment/work-assignment.route'));
router.use('/checkout-sessions', require('../modules/checkout-session/checkout-session.route'));
router.use('/importing-requests', require('../modules/importing-request/importing-request.route'));

module.exports = router;
