const UserModel = require('../modules/user/user.model');
const HttpStatus = require('http-status-codes');
const GLOBAL_CONTSTANT = require('../constant/global.constant');
const { USER_ROLE } = require('../modules/user/user.constant');

module.exports = async (req, res, next) => {
  try {
    const { fromUser } = req;
    const isManager = await UserModel.findOne({ _id: fromUser._id, role: USER_ROLE.MANAGER.type });
    if (!isManager) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        errors: [GLOBAL_CONTSTANT.MESSAGE.ERROR.PERMISSION_DENIED]
      });
    }
    return next();
  } catch (error) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      status: HttpStatus.UNAUTHORIZED,
      errors: [GlobalConstant.MESSAGE.ERROR.PERMISSION_DENIED]
    });
  }
}