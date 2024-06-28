const express = require('express');
let books = require("./booksdb.js");
const axios = require('axios');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }

  if (users[username]) {
      return res.status(409).json({ message: "Username already exists" });
  }

  users[username] = { password };
  return res.status(201).json({ message: "Customer successfully registered, now you can login" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  try {
    res.status(200).json(books);
} catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Internal Server Error' });
}
});

public_users.get('/', async function (req, res) {
  try {
      const response = await axios.get('http://localhost:5000');
      const bookData = response.data;
      res.status(200).json(bookData);
  } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
    
    if (books[isbn]) {
        res.status(200).json(books[isbn]);
    } else {
        res.status(404).json({ error: `Book with ISBN ${isbn} not found` });
    }
 });

 public_users.get('isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  axios.get(`http://localhost:5000/isbn/${isbn}`)
      .then(response => {
          const bookData = response.data;

          if (bookData) {
              res.status(200).json(bookData);
          } else {
              res.status(404).json({ error: `Book with ISBN ${isbn} not found` });
          }
      })
      .catch(error => {
          console.error('Error fetching book details:', error);
          res.status(500).json({ error: 'Internal Server Error' });
      });
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author.toLowerCase();
    const booksByAuthor = [];

    for (let bookId in books) {
        if (books[bookId].author.toLowerCase() === author) {
            booksByAuthor.push(books[bookId]);
        }
    }

    if (booksByAuthor.length > 0) {
        res.status(200).json(booksByAuthor);
    } else {
        res.status(404).json({ error: `No books found by author ${req.params.author}` });
    }
});

async function fetchBooksByAuthor(author) {
  try {
      const response = await axios.get(`http://localhost:5000/author/${author}`);
      return response.data;
  } catch (error) {
      console.error('Error fetching books by author:', error);
      throw error; 
    }
}

public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author.toLowerCase();

  try {
      const booksByAuthor = await fetchBooksByAuthor(author);

      if (booksByAuthor.length > 0) {
          res.status(200).json(booksByAuthor);
      } else {
          res.status(404).json({ error: `No books found by author ${author}` });
      }
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title.toLowerCase();
  const bookDetails = [];

  for (let bookId in books) {
      if (books[bookId].title.toLowerCase() === title) {
          bookDetails.push(books[bookId]);
      }
  }

  if (bookDetails.length > 0) {
      res.status(200).json(bookDetails);
  } else {
      res.status(404).json({ error: `No books found with title "${req.params.title}"` });
  }
});

async function fetchBooksByTitle(title) {
  try {
      const response = await axios.get(`http://localhost:5000/title/${title}`);
      return response.data;
  } catch (error) {
      console.error('Error fetching books by title:', error);
      throw error; 
  }
}

public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title.toLowerCase();

  try {
      const bookDetails = await fetchBooksByTitle(title);

      if (bookDetails.length > 0) {
          res.status(200).json(bookDetails);
      } else {
          res.status(404).json({ error: `No books found with title "${title}"` });
      }
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

  if (books[isbn]) {
      res.status(200).json(books[isbn].reviews);
  } else {
      res.status(404).json({ error: `Book with ISBN ${isbn} not found` });
  }
});

module.exports.general = public_users;
