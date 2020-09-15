const mongoose = require('mongoose');

const { Schema } = mongoose;

const BookSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'Author', required: true },
    summary: { type: String, required: true },
    isbn: { type: String, required: true },
    genre: [{ type: Schema.Types.ObjectId, ref: 'Genre' }],
  },
);

// Virtual for book's URL
/* eslint-disable */
BookSchema
  .virtual('url')
  .get(function() {
    return `/catalog/book/${this._id}`;
  });
/* eslint-enable */
// Export model
module.exports = mongoose.model('Book', BookSchema);