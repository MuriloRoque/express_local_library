const mongoose = require('mongoose');
const moment = require('moment');

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
/* eslint-disable */
AuthorSchema
  .virtual('name')
  .get(function () {
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
/* eslint-enable */

// Virtual for author's lifespan
/* eslint-disable */
AuthorSchema
  .virtual('lifespan')
  .get(function () {
    (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString();
  });
/* eslint-enable */

// Virtual for author's URL
/* eslint-disable */
AuthorSchema
  .virtual('url')
  .get(function() {
    return `/catalog/author/${this._id}`
  });
AuthorSchema
  .virtual('date_of_birth_formatted')
  .get(function () {
    return this.date_of_birth ? moment(this.date_of_birth).format('YYYY-MM-DD') : '';
  });
AuthorSchema
  .virtual('date_of_death_formatted')
  .get(function () {
    return this.date_of_death ? moment(this.date_of_death).format('YYYY-MM-DD') : '';
  });
/* eslint-enable */
// Export model
module.exports = mongoose.model('Author', AuthorSchema);