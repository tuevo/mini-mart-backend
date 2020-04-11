const UserModel = require('../modules/user/user.model');
const jwt = require('jsonwebtoken');
const config = require('config');
const HttpStatus = require('http-status-codes');
const GLOBAL_CONSTANT = require('../constant/global.constant');

module.exports = async (req, res, next) => {
  const token = req.headers[GLOBAL_CONSTANT.TOKEN_NAME] || req.query[GLOBAL_CONSTANT.TOKEN_NAME];
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      status: HttpStatus.UNAUTHORIZED,
      errors: [GLOBAL_CONSTANT.MESSAGE.ERROR.PERMISSION_DENIED]
    });
  }

  try {
    let userInfo = jwt.verify(token, config.get('jwt').secret);
    const user = await UserModel.findOne({ _id: userInfo._id });
    if (!user) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        errors: [GLOBAL_CONSTANT.MESSAGE.ERROR.PERMISSION_DENIED]
      });
    }
    req.fromUser = user;
    return next();
  } catch (error) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      status: HttpStatus.UNAUTHORIZED,
      errors: [GLOBAL_CONSTANT.MESSAGE.ERROR.PERMISSION_DENIED]
    });
  }
}