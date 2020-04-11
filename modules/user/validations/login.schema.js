const Joi = require('@hapi/joi');

const LoginValidationSchema = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().required()
});

module.exports = {
  LoginValidationSchema
};

