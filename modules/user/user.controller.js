const log4js = require('log4js');
const logger = log4js.getLogger('Controllers');
const Joi = require('@hapi/joi');
const responseUtil = require('../../utils/response.util');
const HttpStatus = require("http-status-codes");
const mongoose = require('mongoose');
const UserModel = require('./user.model');
const { LoginValidationSchema } = require('./validations/login.schema');
const { AddUserValidationSchema } = require('./validations/add-user.schema');
const { UpdateProfileValidationSchema } = require('./validations/update-profile.schema');
const { ChangePasswordValidationSchema } = require('./validations/change-password.schema');
const { USER_ROLE, USER_MESSAGE, CONTROLLER_NAME, PASSWORD_SALT_ROUNDS, SEX } = require('./user.constant');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const WorkAssignmentModel = require('../work-assignment/work-assignment.model');
const moment = require('moment');

const login = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::login::was called`);
  try {
    const { error } = Joi.validate(req.body, LoginValidationSchema);
    if (error) {
      return responseUtil.joiValidationResponse(error, res);
    }

    const { username, password } = req.body;
    const user = await UserModel.findOne({ username });
    if (!user) {
      logger.info(`${CONTROLLER_NAME}::login::wrong username`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        errors: [USER_MESSAGE.ERROR.WRONG_USERNAME_OR_PASSWORD]
      });
    }

    const isRightPassword = await bcrypt.compare(password, user.password);
    if (!isRightPassword) {
      logger.info(`${CONTROLLER_NAME}::login::wrong password`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        errors: [USER_MESSAGE.ERROR.WRONG_USERNAME_OR_PASSWORD]
      });
    }

    logger.info(`${CONTROLLER_NAME}::login::success`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: {
        user,
        meta: { token: jwt.sign({ _id: user._id }, config.get('jwt').secret) },
      },
      messages: [USER_MESSAGE.SUCCESS.LOGIN_SUCCESS]
    });
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::login::error`, error);
    return next(error);
  }
}

const addUser = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::addUser::was called`);
  try {
    const { error } = Joi.validate(req.body, AddUserValidationSchema);
    if (error) {
      return responseUtil.joiValidationResponse(error, res);
    }

    const newUserInfo = req.body;
    const isValidRole = USER_ROLE[newUserInfo.role] !== undefined;
    if (!isValidRole) {
      logger.info(`${CONTROLLER_NAME}::addUser::invalid user role`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [USER_MESSAGE.ERROR.INVALID_USER_ROLE]
      });
    }

    const isValidSex = SEX[newUserInfo.sex] !== undefined;
    if (!isValidSex) {
      logger.info(`${CONTROLLER_NAME}::addUser::invalid user sex`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [USER_MESSAGE.ERROR.INVALID_USER_SEX]
      });
    }
    newUserInfo.sex = SEX[newUserInfo.sex].name;

    const duplicatedUser = await UserModel.findOne({ $or: [{ username: newUserInfo.username }, { email: newUserInfo.email }] });
    if (duplicatedUser) {
      if (duplicatedUser.username === newUserInfo.username) {
        logger.info(`${CONTROLLER_NAME}::addUser::duplicated username`);
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: HttpStatus.BAD_REQUEST,
          errors: [USER_MESSAGE.ERROR.DUPLICATED_USERNAME]
        });
      }

      if (duplicatedUser.email === newUserInfo.email) {
        logger.info(`${CONTROLLER_NAME}::addUser::duplicated email`);
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: HttpStatus.BAD_REQUEST,
          errors: [USER_MESSAGE.ERROR.DUPLICATED_EMAIL]
        });
      }
    }

    const hashedPassword = await bcrypt.hash(newUserInfo.password, PASSWORD_SALT_ROUNDS);
    newUserInfo.password = hashedPassword;
    newUserInfo.salaryRate = USER_ROLE[newUserInfo.role].salaryRate;
    const newUser = new UserModel(newUserInfo);
    await newUser.save();

    logger.info(`${CONTROLLER_NAME}::addUser::a new user was added`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { user: newUser },
      messages: [USER_MESSAGE.SUCCESS.ADD_USER_SUCCESS]
    });
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::addUser::error`, error);
    return next(error);
  }
}

const getUsers = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::getUsers::was called`);
  try {
    let condition = {};
    const { role } = req.query;
    if (role) {
      const isValidRole = USER_ROLE[role] !== undefined;
      if (!isValidRole) {
        logger.info(`${CONTROLLER_NAME}::getUsers::invalid role`);
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: HttpStatus.BAD_REQUEST,
          errors: [USER_MESSAGE.ERROR.INVALID_USER_ROLE]
        });
      }

      condition.role = role;
    }

    let users = await UserModel.find(condition, { password: 0 });
    users.sort((a, b) => {
      const time1 = new Date(a.createdAt).getTime();
      const time2 = new Date(b.createdAt).getTime();
      return time2 - time1;
    });

    const startDate = new Date(moment().startOf('day').subtract(moment().isoWeekday() - 1, 'days')).getTime();
    const endDate = new Date(moment().endOf('day').add(7 - moment().isoWeekday(), 'days')).getTime();
    users = await Promise.all(
      users.map(async (u) => {
        let _u = JSON.parse(JSON.stringify(u));
        let workAssignments = await WorkAssignmentModel.find({ assigner: u._id })
          .populate('workShift');

        workAssignments = (workAssignments || []).map(wa => {
          let _wa = JSON.parse(JSON.stringify(wa));
          const workShift = JSON.parse(JSON.stringify(_wa.workShift));
          _wa.startTime = workShift.startTime;
          _wa.endTime = workShift.endTime;
          delete _wa.workShift;
          return _wa;
        });

        // Find work assignments in this week
        workAssignments = workAssignments.filter(wa => {
          const startTime = new Date(wa.startTime).getTime();
          const endTime = new Date(wa.endTime).getTime();
          return startTime >= startDate && endTime <= endDate;
        });

        workAssignments.sort((a, b) => {
          const date1 = new Date(a.startTime).getTime();
          const date2 = new Date(b.startTime).getTime();
          return date1 - date2;
        });

        _u.workAssignments = workAssignments;
        return _u;
      })
    );

    logger.info(`${CONTROLLER_NAME}::getUsers::success`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { users },
      messages: [USER_MESSAGE.SUCCESS.GET_USERS_SUCCESS]
    });
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::getUsers::error`, error);
    return next(error);
  }
}

const updateProfile = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::updateProfile::was called`);
  try {
    const { error } = Joi.validate(req.body, UpdateProfileValidationSchema);
    if (error) {
      return responseUtil.joiValidationResponse(error, res);
    }

    const updatedUserInfo = req.body;
    if (updatedUserInfo.role) {
      const isValidRole = USER_ROLE[updatedUserInfo.role] !== undefined;
      if (!isValidRole) {
        logger.info(`${CONTROLLER_NAME}::updateProfile::invalid role`);
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: HttpStatus.BAD_REQUEST,
          errors: [USER_MESSAGE.ERROR.INVALID_USER_ROLE]
        });
      }
    }

    if (updatedUserInfo.sex) {
      const isValidSex = SEX[updatedUserInfo.sex] !== undefined;
      if (!isValidSex) {
        logger.info(`${CONTROLLER_NAME}::updateProfile::invalid user sex`);
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: HttpStatus.BAD_REQUEST,
          errors: [USER_MESSAGE.ERROR.INVALID_USER_SEX]
        });
      }

      updatedUserInfo.sex = SEX[updatedUserInfo.sex].name;
    }

    const { updatedUserID } = req.params;
    const updatedUser = await UserModel.findOne({ _id: mongoose.Types.ObjectId(updatedUserID) });
    if (!updatedUser) {
      logger.info(`${CONTROLLER_NAME}::updateProfile::user not found`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        errors: [USER_MESSAGE.ERROR.USER_NOT_FOUND]
      });
    }

    for (const key in updatedUserInfo)
      updatedUser[key] = updatedUserInfo[key];

    updatedUser.salaryRate = USER_ROLE[updatedUser.role].salaryRate;
    await updatedUser.save();

    logger.info(`${CONTROLLER_NAME}::updateProfile::an user was updated`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { user: updatedUser },
      messages: [USER_MESSAGE.SUCCESS.UPDATE_PROFILE_SUCCESS]
    });
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::updateProfile::error`);
    return next(error);
  }
}

const changePassword = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::changePassword::was called`);
  try {
    const { error } = Joi.validate(req.body, ChangePasswordValidationSchema);
    if (error) {
      return responseUtil.joiValidationResponse(error, res);
    }

    const { fromUser } = req;
    const user = await UserModel.findOne({ _id: fromUser._id });
    const { currentPassword, newPassword, confirmedNewPassword } = req.body;

    if (newPassword !== confirmedNewPassword) {
      logger.info(`${CONTROLLER_NAME}::changePassword::confirmed password does not match`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [USER_MESSAGE.ERROR.CONFIRMED_NEW_PASSWORD_NOT_MATCHED]
      });
    }

    const isRightPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isRightPassword) {
      logger.info(`${CONTROLLER_NAME}::changePassword::wrong current password`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        errors: [USER_MESSAGE.ERROR.WRONG_CURRENT_PASSWORD]
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, PASSWORD_SALT_ROUNDS);
    user.password = hashedNewPassword;
    await user.save();

    logger.info(`${CONTROLLER_NAME}::changePassword::success`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: {},
      messages: [USER_MESSAGE.SUCCESS.CHANGE_PASSWORD_SUCCESS]
    });
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::changePassword::error`, error);
    return next(error);
  }
}

const deleteUser = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::deleteUser::was called`);
  try {
    const { deletedUserID } = req.params;
    const deletedUser = await UserModel.findOne({ _id: mongoose.Types.ObjectId(deletedUserID) });
    if (!deletedUser) {
      logger.info(`${CONTROLLER_NAME}::deleteUser::user not found`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        errors: [USER_MESSAGE.ERROR.USER_NOT_FOUND]
      });
    }

    await deletedUser.remove();

    logger.info(`${CONTROLLER_NAME}::deleteUser::an user was deleted`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: {},
      messages: [USER_MESSAGE.SUCCESS.DELETE_USER_SUCCESS]
    });
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::deleteUser::error`, error);
    return next(error);
  }
}

module.exports = {
  login,
  addUser,
  getUsers,
  updateProfile,
  changePassword,
  deleteUser
};
