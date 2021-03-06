const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Please enter a category. E.g: chair, table, cooker'],
      trim: true,
      minlength: 2
    },
    files: [
      {
        type: String,
        minlength: [5, 'Minimum of five images required']
      }
    ],
    description: {
      type: String,
      required: [true, 'Kindly describe your product'],
      trim: true,
      minlength: 10
    },
    nameofitem: {
      type: String,
      required: [true, 'E.g: Brown Leather Chair'],
      trim: true,
      minlength: 4
    },
    color: {
      type: String,
      required: [true, 'Enter item color'],
      trim: true,
      minlength: 3
    },
    phone: {
      type: String,
      required: [true, 'Enter your phone number'],
      trim: true,
      minlength: 10,
      maxlength: 10
    },
    address: {
      type: String,
      required: [true, 'Enter your location. E.g Lekki, Aba, Jos'],
      trim: true,
      minlength: 3
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      trim: true,
      minlength: 4
    },
    sellerId: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Product', productSchema)
