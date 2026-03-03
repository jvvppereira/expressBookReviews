const express = require('express');
const books = require("./booksdb.js");
const { isValid, doesExist, users } = require("./auth_users.js");
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.status(200).send(books);
});

// Get book details based on ISBN (International Standard Book Number)
public_users.get('/isbn/:isbn', function (req, res) {
    res.status(200).send(books[req.params.isbn]);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const booksFilteredByAuthor = Object.values(books).filter(book => book.author.toLowerCase() == req.params.author.toLowerCase());
    res.status(200).send(booksFilteredByAuthor);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const booksFilteredByTitle = Object.values(books).filter(book => book.title.toLowerCase().startsWith(req.params.title.toLowerCase()));
    res.status(200).send(booksFilteredByTitle);
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    res.status(200).send(books[req.params.isbn]?.reviews);
});

module.exports.general = public_users;
