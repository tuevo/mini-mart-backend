const express = require('express');
const router = express.Router({});
const UserController = require('./user.controller');
const checkTokenMiddleware = require('../../middlewares/check-token.middleware');
const checkManagerRoleMiddleware = require('../../middlewares/check-manager-role.middleware');

router.get('/', checkTokenMiddleware, checkManagerRoleMiddleware, UserController.getUsers);
router.post('/login', UserController.login);
router.post('/', checkTokenMiddleware, checkManagerRoleMiddleware, UserController.addUser);
router.put('/change-password', checkTokenMiddleware, UserController.changePassword);
router.put('/:updatedUserID', checkTokenMiddleware, checkManagerRoleMiddleware, UserController.updateProfile);
router.delete('/:deletedUserID', checkTokenMiddleware, checkManagerRoleMiddleware, UserController.deleteUser);

module.exports = router;