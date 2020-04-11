const mongoose = require('mongoose');
const { Schema } = mongoose;
const { STATUS } = require('./required-product.constant');

const requiredProductSchema = new Schema(
  {
    importingRequest: {
      type: Schema.Types.ObjectId,
      ref: 'ImportingRequestModel'
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'ProductModel'
    },
    requiredQuantity: {
      type: Number,
      default: 0
    },
    importedQuantity: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      default: STATUS.NOT_YET.type
    }
  },
  { timestamps: true }
);

const RequiredProductModel = mongoose.model('RequiredProductModel', requiredProductSchema, 'RequiredProducts');
module.exports = RequiredProductModel;