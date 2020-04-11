const log4js = require('log4js');
const logger = log4js.getLogger('Controllers');
const Joi = require('@hapi/joi');
const responseUtil = require('../../utils/response.util');
const HttpStatus = require("http-status-codes");
const mongoose = require('mongoose');
const { WORK_SHIFT_MESSAGE, CONTROLLER_NAME } = require('./work-shift.constant');
const { AddWorkShiftValidationSchema } = require('./validations/add-work-shift.schema');
const WorkScheduleModel = require('../work-schedule/work-schedule.model');
const { WORK_SCHEDULE_MESSAGE } = require('../work-schedule/work-schedule.constant');
const WorkShiftModel = require('./work-shift.model');

const addWorkShift = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::addWorkShift::was called`);
  try {
    const { error } = Joi.validate(req.body, AddWorkShiftValidationSchema);
    if (error) {
      return responseUtil.joiValidationResponse(error, res);
    }

    const workShiftInfo = req.body;
    const workSchedule = await WorkScheduleModel.findOne({ _id: mongoose.Types.ObjectId(workShiftInfo.workScheduleID) });
    if (!workSchedule) {
      logger.info(`${CONTROLLER_NAME}::addWorkShift::work schedule not found`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        errors: [WORK_SCHEDULE_MESSAGE.ERROR.WORK_SCHEDULE_NOT_FOUND]
      });
    }

    const startTime = new Date(workShiftInfo.startTime);
    const endTime = new Date(workShiftInfo.endTime);
    const isValidTimeRange = (startTime.getDate() >= 1)
      && (startTime.getTime() < endTime.getTime())
      && (startTime.getMonth() + 1 === workSchedule.month && startTime.getFullYear() === workSchedule.year)
      && (endTime.getMonth() + 1 === workSchedule.month && endTime.getFullYear() === workSchedule.year);

    if (!isValidTimeRange) {
      logger.info(`${CONTROLLER_NAME}::addWorkShift::invalid time range`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [WORK_SHIFT_MESSAGE.ERROR.INVALID_WORK_SHIFT_TIME_RANGE]
      });
    }

    const duplicatedWorkShift = await WorkShiftModel.findOne({
      workSchedule: workShiftInfo.workScheduleID,
      startTime,
      endTime
    });
    if (duplicatedWorkShift) {
      logger.info(`${CONTROLLER_NAME}::addWorkShift::duplicated work shift`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [WORK_SHIFT_MESSAGE.ERROR.DUPLICATED_WORK_SHIFT]
      });
    }

    let newWorkShift = new WorkShiftModel({
      workSchedule: mongoose.Types.ObjectId(workShiftInfo.workScheduleID),
      startTime,
      endTime
    });
    await newWorkShift.save();

    workSchedule.workShifts.push(newWorkShift._id);
    await workSchedule.save();

    newWorkShift = await WorkShiftModel.findOne({ _id: newWorkShift._id }).populate('workSchedule', '-workShifts');

    logger.info(`${CONTROLLER_NAME}::addWorkShift::a new work shift was added`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { workShift: newWorkShift },
      messages: [WORK_SHIFT_MESSAGE.SUCCESS.ADD_WORK_SHIFT_SUCCESS]
    });
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::addWorkShift::error`);
    return next(error);
  }
}

const getWorkShifts = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::getWorkShifts::was called`);
  try {
    const workShifts = await WorkShiftModel.find({})
      .populate('workAssignments', '-workShift')
      .populate('workSchedule', '-workShifts');

    logger.info(`${CONTROLLER_NAME}::getWorkShifts::success`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { workShifts },
      messages: [WORK_SHIFT_MESSAGE.SUCCESS.GET_WORK_SHIFTS_SUCCESS]
    });
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::getWorkShifts::error`);
    return next(error);
  }
}

const removeWorkShift = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::removeWorkShift::was called`);
  try {
    const { workShiftID } = req.params;
    const workShift = await WorkShiftModel.findOne({ _id: mongoose.Types.ObjectId(workShiftID) })
      .populate('workAssignments');
    if (!workShift) {
      logger.info(`${CONTROLLER_NAME}::removeWorkShift::work shift not found`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        errors: [WORK_SHIFT_MESSAGE.ERROR.WORK_SHIFT_NOT_FOUND]
      });
    }

    if (workShift.workAssignments.length > 0) {
      logger.info(`${CONTROLLER_NAME}::removeWorkShift::still has assigner`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [WORK_SHIFT_MESSAGE.ERROR.ASSIGNED_WORK_SHIFT]
      });
    }

    const workSchedule = await WorkScheduleModel.findOne({ _id: workShift.workSchedule });
    workSchedule.workShifts = workSchedule.workShifts.filter(ws => ws !== workShift._id);
    await workSchedule.save();

    await WorkShiftModel.deleteOne({ _id: workShift._id });

    logger.info(`${CONTROLLER_NAME}::removeWorkShift::a work shift was removed`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: {},
      messages: [WORK_SHIFT_MESSAGE.SUCCESS.REMOVE_WORK_SHIFT_SUCCESS]
    })
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::removeWorkShift::error`);
    return next(error);
  }
}

module.exports = {
  addWorkShift,
  getWorkShifts,
  removeWorkShift
}