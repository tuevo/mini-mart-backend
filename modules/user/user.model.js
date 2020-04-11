const mongoose = require('mongoose');
const { Schema } = mongoose;
const { USER_ROLE } = require('./user.constant');

const userSchema = new Schema(
  {
    role: {
      type: String,
      default: USER_ROLE.CASHIER.type
    },
    username: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    fullname: {
      type: String,
      default: null
    },
    sex: {
      type: String,
      required: true
    },
    email: {
      type: String,
      default: null
    },
    phone: {
      type: String,
      default: null
    },
    address: {
      type: String,
      default: null
    },
    dateOfBirth: {
      type: String,
      default: null
    },
    avatar: {
      type: String,
      default: null
    },
    salaryRate: {
      type: Number,
      default: USER_ROLE.CASHIER.salaryRate
    }
  },
  { timestamps: true }
);

const UserModel = mongoose.model('UserModel', userSchema, 'Users');
module.exports = UserModel;