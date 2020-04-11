const log4js = require('log4js');
const logger = log4js.getLogger('Controllers');
const Joi = require('@hapi/joi');
const responseUtil = require('../../utils/response.util');
const HttpStatus = require("http-status-codes");
const { CONTROLLER_NAME, SUPPLIER_MESSAGE } = require('./supplier.constant');
const { USER_ROLE, USER_MESSAGE } = require('../user/user.constant');
const { checkUserPermisson } = require('../user/user.service');
const { AddSupplierValidationSchema } = require('./validations/add-supplier.schema');
const { UpdateSupplierValidationSchema } = require('./validations/update-supplier.schema');
const SupplierModel = require('./supplier.model');
const mongoose = require('mongoose');

const addSupplier = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::addSupplier::was called`);
  try {
    const { error } = Joi.validate(req.body, AddSupplierValidationSchema);
    if (error) {
      return responseUtil.joiValidationResponse(error, res);
    }

    const supplierInfo = req.body;
    const duplicatedSupplier = await SupplierModel.findOne({ name: supplierInfo.name });
    if (duplicatedSupplier) {
      logger.info(`${CONTROLLER_NAME}::addSupplier::duplicated name`)
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [SUPPLIER_MESSAGE.ERROR.DUPLICATED_SUPPLIER]
      });
    }

    const newSupplier = new SupplierModel(supplierInfo);
    await newSupplier.save();

    logger.info(`${CONTROLLER_NAME}::addSupplier::a new supplier was added`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { supplier: newSupplier },
      messages: [SUPPLIER_MESSAGE.SUCCESS.ADD_SUPPLIER_SUCCESS]
    });
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::addSupplier::error`);
    return next(error);
  }
}

const getSuppliers = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::getSuppliers::was called`);
  try {
    const { fromUser } = req;
    const isCashier = await checkUserPermisson(fromUser._id, USER_ROLE.CASHIER.type);
    if (isCashier) {
      logger.info(`${CONTROLLER_NAME}::getSuppliers::permission denied`);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        errors: [USER_MESSAGE.ERROR.PERMISSION_DENIED]
      });
    }

    const suppliers = await SupplierModel.find({}).populate('products', '-supplier');

    logger.info(`${CONTROLLER_NAME}::getSuppliers::success`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { suppliers },
      messages: [SUPPLIER_MESSAGE.SUCCESS.GET_SUPPLIERS_SUCCESS]
    });
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::getSuppliers::error`);
    return next(error);
  }
}

const updateSupplier = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::updateSupplier::was called`);
  try {
    const { error } = Joi.validate(req.body, UpdateSupplierValidationSchema);
    if (error) {
      return responseUtil.joiValidationResponse(error, res);
    }

    const { supplierID } = req.params;
    const updatedSupplier = await SupplierModel.findOne({ _id: mongoose.Types.ObjectId(supplierID) })
      .populate('products', '-supplier');
    if (!updatedSupplier) {
      logger.info(`${CONTROLLER_NAME}::updateSupplier::supplier not found`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        errors: [SUPPLIER_MESSAGE.ERROR.SUPPLIER_NOT_FOUND]
      });
    }

    const params = req.body;
    const queryResults = await SupplierModel.aggregate([
      {
        $project: {
          isNotSupplierToUpdate: { $ne: ['$_id', mongoose.Types.ObjectId(supplierID)] },
          hasDuplicatedName: { $eq: ['$name', params.name] },
          _id: 0
        }
      }
    ]);
    const isDuplicatedSupplier = queryResults.find(supplier => supplier.isNotSupplierToUpdate && supplier.hasDuplicatedName);
    if (isDuplicatedSupplier) {
      logger.info(`${CONTROLLER_NAME}::updateSupplier::duplicated name`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        data: {},
        errors: [SUPPLIER_MESSAGE.ERROR.DUPLICATED_SUPPLIER]
      });
    }

    for (const field in params)
      updatedSupplier[field] = params[field];
    await updatedSupplier.save();

    logger.info(`${CONTROLLER_NAME}::updateSupplier::a supplier was updated`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { supplier: updatedSupplier },
      messages: [SUPPLIER_MESSAGE.SUCCESS.UPDATE_SUPPLIER_SUCCESS]
    });
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::updateSupplier::error`);
    return next(error);
  }
}

const removeSupplier = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::removeSupplier::was called`);
  try {
    const { supplierID } = req.params;
    const deletedSupplier = await SupplierModel.findOne({ _id: mongoose.Types.ObjectId(supplierID) });
    if (!deletedSupplier) {
      logger.info(`${CONTROLLER_NAME}::removeSupplier::supplier not found`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        errors: [SUPPLIER_MESSAGE.ERROR.SUPPLIER_NOT_FOUND]
      });
    }

    if (deletedSupplier.products.length > 0) {
      logger.info(`${CONTROLLER_NAME}::removeSupplier::supplier provides available products`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [SUPPLIER_MESSAGE.ERROR.SUPPLIER_PROVIDES_AVAILABLE_PRODUCT]
      });
    }

    await SupplierModel.deleteOne({ _id: deletedSupplier._id });

    logger.info(`${CONTROLLER_NAME}::removeSupplier::a supplier was removed`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: {},
      messages: [SUPPLIER_MESSAGE.SUCCESS.REMOVE_SUPPLIER_SUCCESS]
    });
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::removeSupplier::error`);
    return next(error);
  }
}

module.exports = {
  addSupplier,
  getSuppliers,
  updateSupplier,
  removeSupplier
}