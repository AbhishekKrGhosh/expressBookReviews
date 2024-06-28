const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{
  "username": "test",
  "password": "test@123"
}];

const isValid = (username)=>{ //returns boolean
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
let validusers = users.filter((user)=>{
  return (user.username === username && user.password === password)
});
if(validusers.length > 0){
  return true;
} else {
  return false;
}
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (isValid(username) && authenticatedUser(username, password)) {
        const accessToken = jwt.sign({ username }, "access", { expiresIn: '1h' });

        req.session.authorization = { accessToken };

        return res.status(200).send("Customer successfully logged in");
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
  });

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review; 
  const { username } = req.user;

  if (!review) {
      return res.status(400).json({ message: "Review content is required" });
  }

  if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
  }

  if (!Array.isArray(books[isbn].reviews)) {
      books[isbn].reviews = [];
  }

  const existingReviewIndex = books[isbn].reviews.findIndex(r => r.username === username);

  if (existingReviewIndex !== -1) {
      books[isbn].reviews[existingReviewIndex].review = review;
      return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated.`);
  } else {
      books[isbn].reviews.push({ username, review });
      return res.status(201).send(`The review for the book with ISBN ${isbn} has been added/updated.`);
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { accessToken } = req.session.authorization;

  if (!accessToken) {
      return res.status(403).json({ message: "User not logged in" });
  }

  jwt.verify(accessToken, "access", (err, decoded) => {
      if (err) {
          return res.status(403).json({ message: "Invalid token" });
      }
      const { username } = decoded; 
      if (!books[isbn]) {
          return res.status(404).json({ message: "Book not found" });
      }

      if (!Array.isArray(books[isbn].reviews)) {
          return res.status(404).json({ message: "No reviews found for this book" });
      }

      const reviewIndex = books[isbn].reviews.findIndex(review => review.username === username);

      if (reviewIndex === -1) {
          return res.status(404).json({ message: "Review not found for this user and book combination" });
      }

      books[isbn].reviews.splice(reviewIndex, 1);

      return res.status(200).send(`Reviews for the ISBN ${isbn} by the user ${username} deleted.`);
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
