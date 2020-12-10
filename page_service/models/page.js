const mongoose = require('mongoose')

const pageSchema = mongoose.Schema({

  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  sorting: {
    type: Number
  }
})

module.exports = mongoose.model('Page', pageSchema)
