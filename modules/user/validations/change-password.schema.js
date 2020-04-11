const Joi = require('@hapi/joi');

const ChangePasswordValidationSchema = Joi.object().keys({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
  confirmedNewPassword: Joi.string().required()
});

module.exports = {
  ChangePasswordValidationSchema
};