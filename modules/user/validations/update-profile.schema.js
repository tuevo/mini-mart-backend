const Joi = require('@hapi/joi');

const UpdateProfileValidationSchema = Joi.object().keys({
  role: Joi.string(),
  fullname: Joi.string(),
  sex: Joi.string(),
  username: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
  address: Joi.string(),
  dateOfBirth: Joi.string(),
  avatar: Joi.string()
});

module.exports = {
  UpdateProfileValidationSchema
};