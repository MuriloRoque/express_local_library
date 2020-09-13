const async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');

exports.index = (req, res) => {
  async.parallel({
    book_count: (callback) => {
      Book.countDocuments({}, callback); // Pass an empty object as match condition
      // to find all documents of this collection
    },
    book_instance_count: (callback) => {
      BookInstance.countDocuments({}, callback);
    },
    book_instance_available_count: (callback) => {
      BookInstance.countDocuments({ status: 'Available' }, callback);
    },
    author_count: (callback) => {
      Author.countDocuments({}, callback);
    },
    genre_count: (callback) => {
      Genre.countDocuments({}, callback);
    },
  }, (err, results) => {
    res.render('index', { title: 'Local Library Home', error: err, data: results });
  });
};

// Display list of all Books.
exports.book_list = (req, res, next) => {
  Book.find({}, 'title author')
    .populate('author')
    .exec((err, listBooks) => {
      if (err) { next(err); }
      // Successful, so render
      res.render('book_list', { title: 'Book List', book_list: listBooks });
    });
};

// Display detail page for a specific book.
exports.book_detail = (req, res, next) => {
  async.parallel({
    book: (callback) => {
      Book.findById(req.params.id)
        .populate('author')
        .populate('genre')
        .exec(callback);
    },
    book_instance: (callback) => {
      BookInstance.find({ book: req.params.id })
        .exec(callback);
    },
  }, (err, results) => {
    if (err) { next(err); }
    if (results.book == null) { // No results.
      err = new Error('Book not found');
      err.status = 404;
      next(err);
    }
    // Successful, so render.
    res.render('book_detail', { title: results.book.title, book: results.book, book_instances: results.book_instance });
  });
};

// Display book create form on GET.
exports.book_create_get = (req, res, next) => {
  // Get all authors and genres, which we can use for adding to our book.
  async.parallel({
    authors: (callback) => {
      Author.find(callback);
    },
    genres: (callback) => {
      Genre.find(callback);
    },
  }, (err, results) => {
    if (err) { next(err); }
    res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres });
  });
};

// Handle book create on POST.
exports.book_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  // Validate fields.
  body('title', 'Title must not be empty.').trim().isLength({ min: 1 }),
  body('author', 'Author must not be empty.').trim().isLength({ min: 1 }),
  body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }),
  body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }),

  // Sanitize fields (using wildcard).
  sanitizeBody('*').escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    const book = new Book(
      {
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: req.body.genre,
      },
    );

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel({
        authors: (callback) => {
          Author.find(callback);
        },
        genres: (callback) => {
          Genre.find(callback);
        },
      }, (err, results) => {
        if (err) { next(err); }

        // Mark our selected genres as checked.
        for (let i = 0; i < results.genres.length; i += 1) {
          /* eslint-disable */
          if (book.genre.indexOf(results.genres[i]._id) > -1) {
            /* eslint-enable */
            results.genres[i].checked = 'true';
          }
        }
        res.render('book_form', {
          title: 'Create Book', authors: results.authors, genres: results.genres, book, errors: errors.array(),
        });
      });
    } else {
      // Data from form is valid. Save book.
      book.save((err) => {
        if (err) { next(err); }
        // successful - redirect to new book record.
        res.redirect(book.url);
      });
    }
  },
];

// Display book delete form on GET.
exports.book_delete_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Book update POST');
};