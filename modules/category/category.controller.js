const log4js = require('log4js');
const logger = log4js.getLogger('Controllers');
const Joi = require('@hapi/joi');
const responseUtil = require('../../utils/response.util');
const HttpStatus = require("http-status-codes");
const { CATEGORY_MESSAGE, CONTROLLER_NAME } = require('./category.constant');
const { AddCategoryValidationSchema } = require('./validations/add-category.schema');
const CategoryModel = require('./category.model');
const mongoose = require('mongoose');
const ProductModel = require('../product/product.model');
const { UpdateCategoryValidationSchema } = require('./validations/update-category.schema');

const addCategory = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::addCategory::was called`);
  try {
    const { error } = Joi.validate(req.body, AddCategoryValidationSchema);
    if (error) {
      return responseUtil.joiValidationResponse(error, res);
    }

    const categoryInfo = req.body;
    const duplicatedCategory = await CategoryModel.findOne({ name: categoryInfo.name });
    if (duplicatedCategory) {
      logger.info(`${CONTROLLER_NAME}::addCategory::duplicated name`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [CATEGORY_MESSAGE.ERROR.DUPLICATED_CATEGORY]
      })
    }

    const newCategory = new CategoryModel(categoryInfo);
    await newCategory.save();

    logger.info(`${CONTROLLER_NAME}::addCategory::a new category was added`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { category: newCategory },
      messages: [CATEGORY_MESSAGE.SUCCESS.ADD_CATEGORY_SUCCESS]
    })
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::addCategory::error`);
    return next(error);
  }
}

const getCategories = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::getCategories::was called`);
  try {
    let categories = await CategoryModel.find({}).populate('products', '-category');

    categories = await Promise.all(
      categories.map(async (category) => {
        const products = await Promise.all(
          category.products.map(async (p) => {
            const product = await ProductModel.findOne({ _id: p._id })
              .populate('supplier', '-products')
              .populate('category', '-products');
            return product;
          })
        );
        category.products = products;
        return category;
      })
    );

    logger.info(`${CONTROLLER_NAME}::getCategories::success`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { categories },
      messages: [CATEGORY_MESSAGE.SUCCESS.GET_CATEGORIES_SUCCESS]
    })
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::getCategories::error`);
    return next(error);
  }
}

const getCategoryProducts = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::getCategoryProducts::was called`);
  try {
    const { categoryID } = req.params;
    const category = await CategoryModel.findOne({ _id: mongoose.Types.ObjectId(categoryID) }).populate('products');
    if (!category) {
      logger.info(`${CONTROLLER_NAME}::getCategoryProducts::category not found`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        errors: [CATEGORY_MESSAGE.ERROR.CATEGORY_NOT_FOUND]
      });
    }

    category.products = await Promise.all(
      category.products.map(async (p) => {
        const product = await ProductModel.findOne({ _id: p._id })
          .populate('supplier', '-products')
          .populate('category', '-products');
        return product;
      })
    );

    logger.info(`${CONTROLLER_NAME}::getCategoryProducts::success`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { products: category.products },
      messages: [CATEGORY_MESSAGE.SUCCESS.GET_CATEGORY_PRODUCTS_SUCCESS]
    })
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::getCategoryProducts::error`);
    return next(error);
  }
}

const updateCategory = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::updateCategory::was called`);
  try {
    const { error } = Joi.validate(req.body, UpdateCategoryValidationSchema);
    if (error) {
      return responseUtil.joiValidationResponse(error, res);
    }

    const { categoryID } = req.params;
    const category = await CategoryModel.findOne({ _id: mongoose.Types.ObjectId(categoryID) });
    if (!category) {
      logger.info(`${CONTROLLER_NAME}::updateCategory::category not found`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        errors: [CATEGORY_MESSAGE.ERROR.CATEGORY_NOT_FOUND]
      });
    }

    category.name = req.body.name;
    await category.save();

    logger.info(`${CONTROLLER_NAME}::updateCategory::a category was updated`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { category },
      messages: [CATEGORY_MESSAGE.SUCCESS.UPDATE_CATEGORY_SUCCESS]
    });
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::updateCategory::error`);
    return next(error);
  }
}

const removeCategory = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::removeCategory::was called`);
  try {
    const { categoryID } = req.params;
    const deletedCategory = await CategoryModel.findOneAndDelete({ _id: mongoose.Types.ObjectId(categoryID) });
    if (!deletedCategory) {
      logger.info(`${CONTROLLER_NAME}::removeCategory::category not found`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        errors: [CATEGORY_MESSAGE.ERROR.CATEGORY_NOT_FOUND]
      });
    }

    logger.info(`${CONTROLLER_NAME}::removeCategory::a category was removed`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: {},
      messages: [CATEGORY_MESSAGE.SUCCESS.REMOVE_CATEGORY_SUCCESS]
    });
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::removeCategory::error`);
    return next(error);
  }
}

module.exports = {
  addCategory,
  getCategories,
  getCategoryProducts,
  updateCategory,
  removeCategory
}