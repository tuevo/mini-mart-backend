const mongoose = require('mongoose');
const { Schema } = mongoose;

const supplierSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      default: null
    },
    address: {
      type: String,
      default: null
    },
    products: [{ type: Schema.Types.ObjectId, ref: 'ProductModel' }]
  },
  { timestamps: true }
);

const SupplierModel = mongoose.model('SupplierModel', supplierSchema, 'Suppliers');
module.exports = SupplierModel;