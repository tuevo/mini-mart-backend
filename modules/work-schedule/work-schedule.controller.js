const log4js = require('log4js');
const logger = log4js.getLogger('Controllers');
const Joi = require('@hapi/joi');
const responseUtil = require('../../utils/response.util');
const HttpStatus = require("http-status-codes");
const { WORK_SCHEDULE_MESSAGE, CONTROLLER_NAME } = require('./work-schedule.constant');
const { AddWorkScheduleValidationSchema } = require('./validations/add-work-schedule.schema');
const WorkScheduleModel = require('./work-schedule.model');
const WorkShiftModel = require('../work-shift/work-shift.model');
const WorkAssignmentModel = require('../work-assignment/work-assignment.model');
const mongoose = require('mongoose');

const addWorkSchedule = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::addWorkSchedule::was called`);
  try {
    const { error } = Joi.validate(req.body, AddWorkScheduleValidationSchema);
    if (error) {
      return responseUtil.joiValidationResponse(error, res);
    }

    const newWorkScheduleInfo = req.body;
    const isValidMonth = newWorkScheduleInfo.month >= 1 && newWorkScheduleInfo.month <= 12;
    if (!isValidMonth) {
      logger.info(`${CONTROLLER_NAME}::addWorkSchedule::invalid month`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [WORK_SCHEDULE_MESSAGE.ERROR.INVALID_WORK_MONTH]
      });
    }

    const isValidYear = newWorkScheduleInfo.year >= 2020;
    if (!isValidYear) {
      logger.info(`${CONTROLLER_NAME}::addWorkSchedule::invalid year`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [WORK_SCHEDULE_MESSAGE.ERROR.INVALID_WORK_YEAR]
      });
    }

    const duplicatedSchedule = await WorkScheduleModel.findOne({
      month: newWorkScheduleInfo.month,
      year: newWorkScheduleInfo.year
    });
    if (duplicatedSchedule) {
      logger.info(`${CONTROLLER_NAME}::addWorkSchedule::duplicated schedule`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [WORK_SCHEDULE_MESSAGE.ERROR.DUPLICATED_WORK_SCHEDULE]
      });
    }

    const newWorkSchedule = new WorkScheduleModel(newWorkScheduleInfo);
    await newWorkSchedule.save();

    logger.info(`${CONTROLLER_NAME}::addWorkSchedule::a work schedule was added`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { workSchedule: newWorkSchedule },
      messages: [WORK_SCHEDULE_MESSAGE.SUCCESS.ADD_WORK_SCHEDULE_SUCCESS]
    })
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::addWorkSchedule::error`);
    return next(error);
  }
}

const getWorkSchedules = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::getWorkSchedules::was called`);
  try {
    const { year } = req.query;
    const condition = { year: 2020 };
    if (year) {
      const isValidYear = !isNaN(year) && year >= 2020;
      if (!isValidYear) {
        logger.info(`${CONTROLLER_NAME}::getWorkSchedulesByYear::invalid year`);
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: HttpStatus.BAD_REQUEST,
          errors: [WORK_SCHEDULE_MESSAGE.ERROR.INVALID_WORK_YEAR]
        });
      }

      condition.year = year;
    }

    let workSchedules = await WorkScheduleModel.find(condition).populate('workShifts', '-workSchedule');
    workSchedules = await Promise.all(
      workSchedules.map(async (workSchedule) => {
        const _workSchedule = JSON.parse(JSON.stringify(workSchedule));

        let workShifts = await WorkShiftModel.find({ workSchedule: _workSchedule._id })
          .populate('workAssignments', '-workShift');

        workShifts.sort((a, b) => {
          const time1 = new Date(a.startTime).getTime();
          const time2 = new Date(b.startTime).getTime();
          return time1 - time2;
        });

        workShifts = await Promise.all(
          workShifts.map(async (ws) => {
            const _ws = JSON.parse(JSON.stringify(ws));

            let workAssignments = await WorkAssignmentModel.find({ workShift: _ws._id }, { workShift: 0 })
              .populate('assigner', '_id fullname avatar role');
            workAssignments.sort((a, b) => {
              const time1 = new Date(a.createdAt).getTime();
              const time2 = new Date(b.createdAt).getTime();
              return time1 - time2;
            });

            _ws.workAssignments = workAssignments;
            return _ws;
          })
        );

        _workSchedule.workShifts = workShifts;
        return _workSchedule;
      })
    );

    workSchedules.sort((cur, next) => cur.month - next.month);

    const availableYears = await WorkScheduleModel.find({}, { year: 1, _id: 0 }).distinct('year');

    logger.info(`${CONTROLLER_NAME}::getWorkSchedules::success`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: {
        workSchedules,
        availableYears
      },
      messages: [WORK_SCHEDULE_MESSAGE.SUCCESS.GET_WORK_SCHEDULES_SUCCESS]
    })
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::getWorkSchedules::error`);
    return next(error);
  }
}

const removeWorkSchedule = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::removeWorkSchedule::was called`);
  try {
    const { workScheduleID } = req.params;
    const workSchedule = await WorkScheduleModel.findOne({ _id: mongoose.Types.ObjectId(workScheduleID) })
      .populate('workShifts');

    if (!workSchedule) {
      logger.info(`${CONTROLLER_NAME}::removeWorkSchedule::work schedule not found`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        errors: [WORK_SCHEDULE_MESSAGE.ERROR.WORK_SCHEDULE_NOT_FOUND]
      });
    }

    if (workSchedule.workShifts.length > 0) {
      logger.info(`${CONTROLLER_NAME}::removeWorkSchedule::still has work shift`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [WORK_SCHEDULE_MESSAGE.ERROR.WORK_SCHEDULE_HAS_WORK_SHIFT]
      });
    }

    await WorkScheduleModel.deleteOne({ _id: workSchedule._id });

    logger.info(`${CONTROLLER_NAME}::removeWorkSchedule::a work schedule was removed`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: {},
      messages: [WORK_SCHEDULE_MESSAGE.SUCCESS.REMOVE_WORK_SCHEDULE_SUCCESS]
    })
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::removeWorkSchedule::error`);
    return next(error);
  }
}

module.exports = {
  addWorkSchedule,
  getWorkSchedules,
  removeWorkSchedule
}