const log4js = require('log4js');
const logger = log4js.getLogger('Controllers');
const Joi = require('@hapi/joi');
const responseUtil = require('../../utils/response.util');
const HttpStatus = require("http-status-codes");
const mongoose = require('mongoose');
const { WORK_ASSIGNMENT_MESSAGE, CONTROLLER_NAME } = require('./work-assignment.constant');
const { AddWorkAssignmentsValidationSchema } = require('./validations/add-work-assignments.schema');
const UserModel = require('../user/user.model');
const WorkShiftModel = require('../work-shift/work-shift.model');
const WorkAssignmentModel = require('./work-assignment.model');
const { USER_MESSAGE } = require('../user/user.constant');
const { WORK_SHIFT_MESSAGE } = require('../work-shift/work-shift.constant');

const addWorkAssignments = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::addWorkAssignments::was called`);
  try {
    const { error } = Joi.validate(req.body, AddWorkAssignmentsValidationSchema);
    if (error) {
      return responseUtil.joiValidationResponse(error, res);
    }

    const { fromUser } = req;
    const workAssignmentInfo = req.body;
    const workShift = await WorkShiftModel.findOne({ _id: workAssignmentInfo.workShift });
    if (!workShift) {
      logger.info(`${CONTROLLER_NAME}::addWorkAssignments::work shift not found`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        errors: [WORK_SHIFT_MESSAGE.ERROR.WORK_SHIFT_NOT_FOUND]
      });
    }

    const { assigners } = req.body;
    const checkAssignerErrors = await Promise.all(
      assigners.map(async (assignerID) => {
        const assigner = await UserModel.findOne({ _id: mongoose.Types.ObjectId(assignerID) });
        if (!assigner) {
          logger.info(`${CONTROLLER_NAME}::addWorkAssignments::assigner not found`);
          return {
            status: HttpStatus.NOT_FOUND,
            errors: [USER_MESSAGE.ERROR.USER_NOT_FOUND]
          }
        } else {
          const duplicatedWorkAssignment = await WorkAssignmentModel.findOne({
            workShift: workShift._id,
            assigner: assigner._id
          });

          if (duplicatedWorkAssignment) {
            logger.info(`${CONTROLLER_NAME}::addWorkAssignments::duplicated work assignment`);
            return {
              status: HttpStatus.BAD_REQUEST,
              errors: [WORK_ASSIGNMENT_MESSAGE.ERROR.DUPLICATED_WORK_ASSIGNMENT]
            }
          }

          return null;
        }
      })
    );

    if (checkAssignerErrors[0]) {
      return res.status(checkAssignerErrors[0].status).json(checkAssignerErrors[0]);
    }

    let newWorkAssignments = await Promise.all(
      assigners.map(async (assignerID) => {
        let newWorkAssignment = new WorkAssignmentModel({
          assigner: assignerID,
          manager: fromUser._id,
          workShift: workShift._id,
          description: null
        });
        await newWorkAssignment.save();
        workShift.workAssignments.push(newWorkAssignment._id);
        return newWorkAssignment;
      })
    );

    await workShift.save();

    newWorkAssignments = await WorkAssignmentModel.find({ workShift: workShift._id }, { workShift: 0 })
      .populate('assigner', '_id fullname avatar role');

    logger.info(`${CONTROLLER_NAME}::addWorkAssignments::success`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { workAssignments: newWorkAssignments },
      messages: [WORK_ASSIGNMENT_MESSAGE.SUCCESS.ADD_WORK_ASSIGNMENT_SUCCESS]
    });
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::addWorkAssignments::error`);
    return next(error);
  }
}

const getWorkAssignments = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::getWorkAssignments::was called`);
  try {
    const { assignerID } = req.query;
    const assigner = await UserModel.findOne({ _id: mongoose.Types.ObjectId(assignerID) });
    if (!assigner) {
      logger.info(`${CONTROLLER_NAME}::getWorkAssignments::assigner not found`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        errors: [USER_MESSAGE.ERROR.USER_NOT_FOUND]
      });
    }

    let workAssignments = await WorkAssignmentModel.find({ assigner: assigner._id }).populate('workShift');
    workAssignments = await Promise.all(workAssignments.map(async (wa) => {
      const _wa = JSON.parse(JSON.stringify(wa));
      let workShift = await WorkShiftModel.findOne({ _id: _wa.workShift._id }, { workAssignments: 0 })
        .populate('workSchedule', '-workShifts');
      _wa.workShift = workShift;
      return _wa;
    }));

    logger.info(`${CONTROLLER_NAME}::getWorkAssignments::success`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { workAssignments },
      messages: [WORK_ASSIGNMENT_MESSAGE.SUCCESS.ADD_WORK_ASSIGNMENT_SUCCESS]
    });
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::getWorkAssignments::error`);
    return next(error);
  }
}

const removeWorkAssignment = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::removeWorkAssignment::was called`);
  try {
    const { workAssignmentID } = req.params;
    const workAssignment = await WorkAssignmentModel.findOne({ _id: mongoose.Types.ObjectId(workAssignmentID) });
    if (!workAssignment) {
      logger.info(`${CONTROLLER_NAME}::removeWorkAssignment::work assignment not found`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        errors: [WORK_ASSIGNMENT_MESSAGE.ERROR.WORK_ASSIGNMENT_NOT_FOUND]
      })
    }

    const workShift = await WorkShiftModel.findOne({ _id: workAssignment.workShift });
    workShift.workAssignments = workShift.workAssignments.filter(wa => wa !== workAssignment._id);
    await workShift.save();

    await WorkAssignmentModel.deleteOne({ _id: workAssignment._id });

    logger.info(`${CONTROLLER_NAME}::removeWorkAssignment::a work assignment was removed`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: {},
      messages: [WORK_ASSIGNMENT_MESSAGE.SUCCESS.REMOVE_WORK_ASSIGNMENT_SUCCESS]
    })
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::removeWorkAssignment::error`);
    return next(error);
  }
}

module.exports = {
  addWorkAssignments,
  getWorkAssignments,
  removeWorkAssignment
}