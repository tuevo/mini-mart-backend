const mongoose = require('mongoose');
const { Schema } = mongoose;
const checkoutSessionSchema = new Schema(
  {
    cashier: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'UserModel'
    },
    soldItems: [{ type: Schema.Types.ObjectId, ref: 'SoldItemModel' }],
    priceTotal: {
      type: Number,
      default: 0
    },
    submittedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

const CheckoutSessionModel = mongoose.model('CheckoutSessionModel', checkoutSessionSchema, 'CheckoutSessions');
module.exports = CheckoutSessionModel;