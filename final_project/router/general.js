const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.query.username;
  const password = req.query.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({"username": username, "password": password});
      return res.status(200).json({ message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({ message: "User already exists!"});
    }
  }
  return res.status(404).json({ message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books, null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(JSON.stringify(books[isbn],null,4));
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  let booksByAuthor = [];

  const isbns = Object.keys(books);

  for (let isbn of isbns) {
    const book = books[isbn];
    if (book.author.toLowerCase() === author.toLowerCase()) {
      booksByAuthor.push(book);
    }
  }

  if (booksByAuthor.length > 0) {
    return res.send(JSON.stringify(booksByAuthor,null,4));
  } else {
    return res.status(404).json({message: "No books found by this author"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  let booksByTitle = [];

  const isbns = Object.keys(books);

  for (let isbn of isbns) {
    const book = books[isbn];
    if (book.title.toLowerCase() === title.toLowerCase()) {
      booksByTitle.push(book);
    }
  }

  if (booksByTitle.length > 0) {
    return res.send(JSON.stringify(booksByTitle,null,4));
  } else {
    return res.status(404).json({message: "No books found by this title"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(JSON.stringify(books[isbn].reviews,null,4));
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;

const axios = require('axios');

public_users.get('/promise',function (req, res) {
  new Promise((resolve, reject) => {
    resolve(books);
  })
  .then((bookData) => {
    res.status(200).json(bookData);
  })
  .catch((err) => {
    res.status(500).json({ message: "Error fetching books"});
  });
});

public_users.get('/promise/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  new Promise((resolve, reject) => {
    // Simulate async database/API lookup
    process.nextTick(() => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject(new Error("Book not found"));
      }
    });
  })
  .then((book) => {
    res.status(200).json({
      message: "Book found successfully",
      book: book
    });
  })
  .catch((err) => {
    res.status(404).json({
      message: err.message
    });
  });
});

public_users.get('/promise/author/:author', function(req, res) {
  const author = req.params.author.toLowerCase();
  
  new Promise((resolve, reject) => {
      // Simulate async operation
      process.nextTick(() => {
          const booksByAuthor = [];
          const isbns = Object.keys(books);
          
          for (let isbn of isbns) {
              if (books[isbn].author.toLowerCase() === author) {
                  booksByAuthor.push({
                      isbn: isbn,
                      ...books[isbn]
                  });
              }
          }
          
          if (booksByAuthor.length > 0) {
              resolve(booksByAuthor);
          } else {
              reject(new Error("No books found by this author"));
          }
      });
  })
  .then((books) => {
      res.status(200).json({
          message: "Books found successfully",
          count: books.length,
          books: books
      });
  })
  .catch((err) => {
      res.status(404).json({
          message: err.message
      });
  });
});

public_users.get('/promise/title/:title', function(req, res) {
  const searchTitle = req.params.title.toLowerCase();
  
  new Promise((resolve, reject) => {
      // Simulate async database operation
      process.nextTick(() => {
          const matchingBooks = [];
          const isbns = Object.keys(books);
          
          for (let isbn of isbns) {
              const bookTitle = books[isbn].title.toLowerCase();
              if (bookTitle.includes(searchTitle)) {
                  matchingBooks.push({
                      isbn: isbn,
                      ...books[isbn]
                  });
              }
          }
          
          if (matchingBooks.length > 0) {
              resolve(matchingBooks);
          } else {
              reject(new Error("No books found with matching title"));
          }
      });
  })
  .then((books) => {
      res.status(200).json({
          message: "Books found successfully",
          count: books.length,
          books: books
      });
  })
  .catch((err) => {
      res.status(404).json({
          message: err.message
      });
  });
});