const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      default: null
    },
    products: [{ type: Schema.Types.ObjectId, ref: 'ProductModel' }]
  },
  { timestamps: true }
);

const CategoryModel = mongoose.model('CategoryModel', categorySchema, 'Categories');
module.exports = CategoryModel;