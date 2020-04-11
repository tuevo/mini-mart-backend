const router = require('express').Router({});
const checkTokenMiddleware = require('../../middlewares/check-token.middleware');
const checkManagerRoleMiddleware = require('../../middlewares/check-manager-role.middleware');
const WorkAssignmentController = require('./work-assignment.controller');

router.get('/', checkTokenMiddleware, WorkAssignmentController.getWorkAssignments);
router.post('/', checkTokenMiddleware, checkManagerRoleMiddleware, WorkAssignmentController.addWorkAssignments);
router.delete('/:workAssignmentID', checkTokenMiddleware, WorkAssignmentController.removeWorkAssignment);

module.exports = router;