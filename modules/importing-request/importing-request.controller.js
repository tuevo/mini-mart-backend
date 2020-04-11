const log4js = require('log4js');
const logger = log4js.getLogger('Controllers');
const Joi = require('@hapi/joi');
const responseUtil = require('../../utils/response.util');
const HttpStatus = require("http-status-codes");
const { CONTROLLER_NAME, IMPORTING_REQUEST_MESSAGE, STATUS } = require('./importing-request.constant');
const { createImportingRequestValidationSchema } = require('./validations/create-importing-request.schema');
const ProductModel = require('../product/product.model');
const _ = require('lodash');
const ImportingRequestModel = require('./importing-request.model');
const RequiredProductModel = require('../required-product/required-product.model');

const createImportingRequest = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::createImportingRequest::was called`);
  try {
    const { error } = Joi.validate(req.body, createImportingRequestValidationSchema);
    if (error) {
      return responseUtil.joiValidationResponse(error, res);
    }

    const { products } = req.body;
    if (products.length === 0) {
      logger.info(`${CONTROLLER_NAME}::createImportingRequest::list required products cannot be empty`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [IMPORTING_REQUEST_MESSAGE.ERROR.EMPTY_LIST_REQUIRED_PRODUCTS]
      });
    }

    const availableProducts = await ProductModel.find({});
    const notAvailableProducts = products.filter(
      pid => _.findIndex(availableProducts, ap => ap._id.toString() === pid) < 0
    );
    if (notAvailableProducts.length > 0) {
      logger.info(`${CONTROLLER_NAME}::createImportingRequest::required product not found`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        data: { notAvailableProducts },
        errors: [IMPORTING_REQUEST_MESSAGE.ERROR.REQUIRED_PRODUCT_NOT_FOUND]
      });
    }

    const newImportingRequest = new ImportingRequestModel({
      sender: req.fromUser._id
    });
    await newImportingRequest.save();

    const requiredProducts = await Promise.all(
      products.map(async (pid) => {
        const product = new RequiredProductModel({
          product: pid,
          importingRequest: newImportingRequest._id
        });
        await product.save();
        return product;
      })
    );

    newImportingRequest.requiredProducts = requiredProducts.map(rp => rp._id);
    await newImportingRequest.save();

    logger.info(`${CONTROLLER_NAME}::createImportingRequest::a new importing request was created`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { importingRequest: newImportingRequest },
      messages: [IMPORTING_REQUEST_MESSAGE.SUCCESS.CREATE_IMPORTING_REQUEST_SUCCESS]
    });
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::createImportingRequest::error`);
    next(error);
  }
}

const getImportingRequests = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::getImportingRequests::was called`);
  try {
    const importingRequests = await ImportingRequestModel.find({})
      .populate('sender')
      .populate('executor')
      .populate('accepter')
      .populate({
        path: 'requiredProducts',
        select: '-importingRequest',
        populate: { path: 'product' }
      });

    logger.info(`${CONTROLLER_NAME}::getImportingRequests::success`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { importingRequests },
      messages: [IMPORTING_REQUEST_MESSAGE.SUCCESS.GET_IMPORTING_REQUESTS_SUCCESS]
    })
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::getImportingRequests::error`);
    next(error);
  }
}

module.exports = {
  createImportingRequest,
  getImportingRequests
}