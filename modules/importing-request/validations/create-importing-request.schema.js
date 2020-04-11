const Joi = require('@hapi/joi');

const createImportingRequestValidationSchema = Joi.object().keys({
  products: Joi.array().required()
});

module.exports = {
  createImportingRequestValidationSchema
}