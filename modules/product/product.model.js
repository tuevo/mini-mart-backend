const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      default: null
    },
    image: {
      type: String,
      default: null
    },
    price: {
      type: Number,
      default: 0
    },
    availableQuantity: {
      type: Number,
      default: 0
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'CategoryModel',
      required: true
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'SupplierModel',
      required: true
    }
  },
  { timestamps: true }
);

const ProductModel = mongoose.model('ProductModel', productSchema, 'Products');
module.exports = ProductModel;
