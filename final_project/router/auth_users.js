const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });

  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });

  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.query.username;
  const password = req.query.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60*60});

    req.session.authenticated = true;

    req.session.authorization = {
      accessToken, username
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.body.review;
  const rating = req.body.rating;
  const username = req.session.authorization.username;
  
  if (!reviewText || !rating) {
    return res.status(400).json({ message: "Review text and rating are required"});
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found"});
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = {
    username: username,
    rating: rating,
    comment: reviewText
  };

  return res.status(200).json({
    message: "Review submitted successfully",
    book: books[isbn]
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found"});
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({message: "You didn't review this book."});
  } else {
    
    delete books[isbn].reviews[username];

    return res.status(200).json({message: "Review deleted successfully"})
  };
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
