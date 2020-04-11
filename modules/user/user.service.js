const UserModel = require('./user.model');

const checkUserPermisson = async (_id, role) => {
  const userByRole = await UserModel.findOne({ _id, role });
  return userByRole ? true : false;
}

const getCustomUserInfo = (user) => {
  const basicInfo = JSON.parse(JSON.stringify(user));
  delete basicInfo.username;
  delete basicInfo.password;
  return basicInfo;
}

module.exports = {
  checkUserPermisson,
  getCustomUserInfo
}
