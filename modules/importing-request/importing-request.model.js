const mongoose = require('mongoose');
const { Schema } = mongoose;
const { STATUS } = require('./importing-request.constant');

const importingRequestSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'UserModel',
      required: true
    },
    accepter: {
      type: Schema.Types.ObjectId,
      ref: 'UserModel',
      default: null
    },
    executor: {
      type: Schema.Types.ObjectId,
      ref: 'UserModel',
      default: null
    },
    status: {
      type: String,
      default: STATUS.PENDING.type
    },
    requiredProducts: [
      { type: Schema.Types.ObjectId, ref: 'RequiredProductModel' }
    ],
    priceTotal: {
      type: Number,
      default: 0
    },
    acceptedAt: {
      type: Date,
      default: null
    },
    finishedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

const ImportingRequestModel = mongoose.model('ImportingRequestModel', importingRequestSchema, 'ImportingRequests');
module.exports = ImportingRequestModel;