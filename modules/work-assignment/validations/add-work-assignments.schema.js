const Joi = require('@hapi/joi');

const AddWorkAssignmentsValidationSchema = Joi.object().keys({
  workShift: Joi.string().required(),
  assigners: Joi.array().items(Joi.string()).required()
});

module.exports = {
  AddWorkAssignmentsValidationSchema
}