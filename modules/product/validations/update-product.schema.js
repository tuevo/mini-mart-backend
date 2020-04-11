const Joi = require('@hapi/joi');

const UpdateProductValidationSchema = Joi.object().keys({
  name: Joi.string(),
  image: Joi.string(),
  price: Joi.number(),
  availableQuantity: Joi.number(),
  supplier: Joi.string()
});

module.exports = {
  UpdateProductValidationSchema
}