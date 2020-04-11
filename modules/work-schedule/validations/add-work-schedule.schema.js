const Joi = require('@hapi/joi');

const AddWorkScheduleValidationSchema = Joi.object().keys({
  month: Joi.number().required(),
  year: Joi.number().required()
});

module.exports = {
  AddWorkScheduleValidationSchema
}