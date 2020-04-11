const Joi = require('@hapi/joi');

const UpdateCategoryValidationSchema = Joi.object().keys({
  name: Joi.string().required()
});

module.exports = {
  UpdateCategoryValidationSchema
}