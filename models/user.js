const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Enter your name'],
      trim: true,
      minlength: 3
    },
    email: {
      type: String,
      required: [true, 'Please enter your email']
    },
    state: { type: String, minlength: 3 }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('users', userSchema)
