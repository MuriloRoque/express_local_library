const mongoose = require('mongoose');

const { Schema } = mongoose;

const AuthorSchema = new Schema(
  {
    first_name: { type: String, required: true, maxlength: 100 },
    family_name: { type: String, required: true, maxlength: 100 },
    date_of_birth: { type: Date },
    date_of_death: { type: Date },
  },
);

// Virtual for author's full name
AuthorSchema
  .virtual('name')
  .get(() => {
    // To avoid errors in cases where an author does not have either a family name or first name
    // We want to make sure we handle the exception by returning an empty string for that case

    let fullname = '';
    if (this.first_name && this.family_name) {
      fullname = `${this.family_name}, ${this.first_name}`;
    }
    if (!this.first_name || !this.family_name) {
      fullname = '';
    }

    return fullname;
  });

// Virtual for author's lifespan
AuthorSchema
  .virtual('lifespan')
  .get(() => (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString());

// Virtual for author's URL
/* eslint-disable */
AuthorSchema
  .virtual('url')
  .get(() => `/catalog/author/${this._id}`);
/* eslint-enable */
// Export model
module.exports = mongoose.model('Author', AuthorSchema);