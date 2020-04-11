const router = require('express').Router({});
const checkTokenMiddleware = require('../../middlewares/check-token.middleware');
const checkManagerRoleMiddleware = require('../../middlewares/check-manager-role.middleware');
const WorkShiftController = require('./work-shift.controller');

router.get('/', checkTokenMiddleware, checkManagerRoleMiddleware, WorkShiftController.getWorkShifts);
router.post('/', checkTokenMiddleware, checkManagerRoleMiddleware, WorkShiftController.addWorkShift);
router.delete('/:workShiftID', checkTokenMiddleware, checkManagerRoleMiddleware, WorkShiftController.removeWorkShift);

module.exports = router;