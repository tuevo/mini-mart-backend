const Joi = require('@hapi/joi');

const SubmitCheckoutSessionValidationSchema = Joi.object().keys({
  products: Joi.array().required()
});

module.exports = {
  SubmitCheckoutSessionValidationSchema
}