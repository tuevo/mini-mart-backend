const log4js = require('log4js');
const logger = log4js.getLogger('Controllers');
const Joi = require('@hapi/joi');
const responseUtil = require('../../utils/response.util');
const HttpStatus = require("http-status-codes");
const { CHECKOUT_SESSION_MESSAGE, CONTROLLER_NAME } = require('./checkout-session.constant');
const CheckoutSessionModel = require('./checkout-session.model');
const mongoose = require('mongoose');
const { SubmitCheckoutSessionValidationSchema } = require('./validations/submit-checkout-session.schema');
const ProductModel = require('../product/product.model');
const SoldItemModel = require('../sold-item/sold-item.model');
const _ = require('lodash');

const createCheckoutSession = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::createCheckoutSession::was called`);
  try {
    const { fromUser } = req;
    const checkoutSession = new CheckoutSessionModel({ cashier: fromUser._id });
    await checkoutSession.save();

    const availableProducts = await ProductModel.find({})
      .populate('supplier', '-products')
      .populate('category', '-products');

    logger.info(`${CONTROLLER_NAME}::createCheckoutSession::a new checkout session was created`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: {
        checkoutSession,
        availableProducts
      },
      messages: [CHECKOUT_SESSION_MESSAGE.SUCCESS.CREATE_CHECKOUT_SESSION_SUCCESS]
    })
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::createCheckoutSession::error`);
    next(error);
  }
}

const getCheckoutSessions = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::getCheckoutSessions::was called`);
  try {
    const { fromUser } = req;
    let checkoutSessions = await CheckoutSessionModel
      .find({ cashier: mongoose.Types.ObjectId(fromUser._id) })
      .populate({
        path: 'soldItems',
        select: '-checkoutSession',
        populate: { path: 'product', select: 'name price availableQuantity' }
      });
    checkoutSessions.sort((a, b) => {
      const d1 = new Date(a.submittedAt).getTime();
      const d2 = new Date(b.submittedAt).getTime();
      return d2 - d1;
    });

    logger.info(`${CONTROLLER_NAME}::getCheckoutSessions::success`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { checkoutSessions },
      messages: [CHECKOUT_SESSION_MESSAGE.SUCCESS.GET_CHECKOUT_SESSIONS_SUCCESS]
    });
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::getCheckoutSessions::error`);
    next(error);
  }
}

const cancelCheckoutSession = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::cancelCheckoutSession::was called`);
  try {
    const { checkoutSessionID } = req.params;
    let checkoutSession = await CheckoutSessionModel.findOne({ _id: mongoose.Types.ObjectId(checkoutSessionID) });
    if (!checkoutSession) {
      logger.info(`${CONTROLLER_NAME}::cancelCheckoutSession::checkout session not found`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        errors: [CHECKOUT_SESSION_MESSAGE.ERROR.CHECKOUT_SESSION_NOT_FOUND]
      });
    }

    if (checkoutSession.soldItems.length > 0) {
      logger.info(`${CONTROLLER_NAME}::cancelCheckoutSession::checkout session cannot be cancelled after being submitted`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [CHECKOUT_SESSION_MESSAGE.ERROR.CHECKOUT_SESSION_CANNOT_BE_CANCELLED]
      });
    }

    await CheckoutSessionModel.deleteOne({ _id: mongoose.Types.ObjectId(checkoutSessionID) });

    logger.info(`${CONTROLLER_NAME}::cancelCheckoutSession::a checkout session was cancelled`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: {},
      messages: [CHECKOUT_SESSION_MESSAGE.SUCCESS.CANCEL_CHECKOUT_SESSION_SUCCESS]
    });
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::cancelCheckoutSession::error`);
    next(error);
  }
}

const submitCheckoutSession = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::submitCheckoutSession::was called`);
  try {
    const { error } = Joi.validate(req.body, SubmitCheckoutSessionValidationSchema);
    if (error) {
      return responseUtil.joiValidationResponse(error, res);
    }

    const { checkoutSessionID } = req.params;
    let checkoutSession = await CheckoutSessionModel.findOne({ _id: mongoose.Types.ObjectId(checkoutSessionID) });
    if (!checkoutSession) {
      logger.info(`${CONTROLLER_NAME}::submitCheckoutSession::checkout session not found`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        errors: [CHECKOUT_SESSION_MESSAGE.ERROR.CHECKOUT_SESSION_NOT_FOUND]
      });
    }

    if (checkoutSession.submittedAt) {
      logger.info(`${CONTROLLER_NAME}::submitCheckoutSession::checkout session was submitted`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [CHECKOUT_SESSION_MESSAGE.ERROR.CHECKOUT_SESSION_WAS_SUBMITTED]
      });
    }

    let { products } = req.body;
    if (products.length === 0) {
      logger.info(`${CONTROLLER_NAME}::submitCheckoutSession::list products cannot be empty`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [CHECKOUT_SESSION_MESSAGE.ERROR.CHECKOUT_SESSION_EMPTY_LIST_PRODUCTS]
      });
    }

    products = _.countBy(products);

    let availableProducts = await Promise.all(
      Object.keys(products).map(async (pid) => {
        const product = await ProductModel.findOne({ _id: mongoose.Types.ObjectId(pid) })
          .populate('category', 'name')
          .populate('supplier', 'name');
        return product;
      })
    );
    availableProducts = availableProducts.filter(p => p);

    if (Object.keys(products).length !== availableProducts.length) {
      logger.info(`${CONTROLLER_NAME}::submitCheckoutSession::list products has item not found`);

      const notExistedProductIDs = Object.keys(products)
        .filter(pid => _.findIndex(availableProducts, ap => ap._id === pid) < 0);

      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        data: { notExistedProductIDs },
        errors: [CHECKOUT_SESSION_MESSAGE.ERROR.CHECKOUT_SESSION_PRODUCT_NOT_FOUND]
      });
    }

    let lackingItems = [];
    let soldItems = [];
    for (const pid of Object.keys(products)) {
      const product = availableProducts.find(p => p._id.toString() === pid);
      const requiredQuantity = products[pid];
      let { availableQuantity } = product;
      let lackingQuantity = 0;
      let soldQuantity = 0;

      if (requiredQuantity <= product.availableQuantity) {
        soldQuantity = requiredQuantity;
        availableQuantity -= soldQuantity;
      } else {
        soldQuantity = availableQuantity;
        lackingQuantity = Math.abs(availableQuantity - requiredQuantity);
        availableQuantity = 0;
      }

      if (lackingQuantity > 0) {
        lackingItems.push({
          product,
          requiredQuantity,
          availableQuantity: requiredQuantity - lackingQuantity
        });
      } else {
        product.availableQuantity = availableQuantity;
        soldItems.push({
          product: product._id,
          quantity: soldQuantity
        });
      }
    }

    if (lackingItems.length > 0) {
      logger.info(`${CONTROLLER_NAME}::submitCheckoutSession::lack of product`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        data: { lackingItems },
        errors: [CHECKOUT_SESSION_MESSAGE.ERROR.CHECKOUT_SESSION_LACK_OF_PRODUCT]
      });
    }

    const productsDataSource = await ProductModel.find({});
    await Promise.all(
      productsDataSource.map(async (p) => {
        const productToUpdate = availableProducts.find(ap => ap._id.toString() === p._id.toString());
        if (productToUpdate) {
          p.availableQuantity = productToUpdate.availableQuantity;
        }
        await p.save();
        return p;
      })
    );

    soldItems = await Promise.all(
      soldItems.map(async (item) => {
        const soldItem = new SoldItemModel({ ...item, checkoutSession: checkoutSession._id });
        await soldItem.save();
        return soldItem;
      })
    );

    soldItems = await SoldItemModel.find({ checkoutSession: checkoutSession._id })
      .populate('product', 'name price availableQuantity');

    checkoutSession.soldItems = soldItems.map(item => item._id);
    checkoutSession.priceTotal = soldItems.reduce((acc, cur) => acc + (cur.product.price * cur.quantity), 0);
    checkoutSession.submittedAt = new Date();
    await checkoutSession.save();

    checkoutSession.soldItems = soldItems;

    logger.info(`${CONTROLLER_NAME}::submitCheckoutSession::success`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { checkoutSession },
      messages: [CHECKOUT_SESSION_MESSAGE.SUCCESS.SUBMIT_CHECKOUT_SESSION_SUCCESS]
    })
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::submitCheckoutSession::error`);
    next(error);
  }
}

module.exports = {
  createCheckoutSession,
  submitCheckoutSession,
  cancelCheckoutSession,
  getCheckoutSessions
}