const mongoose = require('mongoose');
const { Schema } = mongoose;
const soldItemSchema = new Schema(
  {
    checkoutSession: {
      type: Schema.Types.ObjectId,
      ref: 'CheckoutSessionModel'
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'ProductModel'
    },
    quantity: {
      type: Number,
      default: 1
    }
  },
  { timestamps: true }
);

const SoldItemModel = mongoose.model('SoldItemModel', soldItemSchema, 'SoldItems');
module.exports = SoldItemModel;