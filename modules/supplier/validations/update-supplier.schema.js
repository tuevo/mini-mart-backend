const Joi = require('@hapi/joi');

const UpdateSupplierValidationSchema = Joi.object().keys({
  name: Joi.string().required(),
  phone: Joi.string().required(),
  address: Joi.string().required()
});

module.exports = {
  UpdateSupplierValidationSchema
};