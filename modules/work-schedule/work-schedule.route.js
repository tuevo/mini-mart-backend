const router = require('express').Router({});
const checkTokenMiddleware = require('../../middlewares/check-token.middleware');
const checkManagerRoleMiddleware = require('../../middlewares/check-manager-role.middleware');
const WorkScheduleController = require('./work-schedule.controller');

router.get('/', checkTokenMiddleware, checkManagerRoleMiddleware, WorkScheduleController.getWorkSchedules);
router.post('/', checkTokenMiddleware, checkManagerRoleMiddleware, WorkScheduleController.addWorkSchedule);
router.delete('/:workScheduleID', checkTokenMiddleware, checkManagerRoleMiddleware, WorkScheduleController.removeWorkSchedule);

module.exports = router;