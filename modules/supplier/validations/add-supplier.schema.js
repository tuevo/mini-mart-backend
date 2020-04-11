const Joi = require('@hapi/joi');

const AddSupplierValidationSchema = Joi.object().keys({
  name: Joi.string().required(),
  phone: Joi.string().required(),
  address: Joi.string().required()
});

module.exports = {
  AddSupplierValidationSchema
};