const express = require('express');
const jwt = require('jsonwebtoken');
const books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if a user with the given username already exists
const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn
    const book = books[isbn]

    if (!book) {
        return res.status(404).send(`Not found a book with ${isbn} ISBN`);
    }

    const newReview = req.body.review;
    const nextIndex = Number(Object.keys(book.reviews).pop()) + 1

    book.reviews[nextIndex] = { text: newReview, createdBy: req.session.authorization['username'] }

    return res.status(200).send(`Review '${newReview}' was added to ${isbn} - '${book.title}' book`);
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn
    const book = books[isbn]

    if (!book) {
        return res.status(404).send(`Not found a book with ${isbn} ISBN`);
    }

    const username = req.session.authorization['username'];

    for (let [id, review] of Object.entries(book.reviews)) {
        if (review?.createdBy == username) {
            delete book.reviews[id]
        }
    }

    return res.status(200).send(`Deleted all reviews of ${isbn} - '${book.title}' book added by '${username}' user`);
});

module.exports.authenticated = regd_users;
module.exports.doesExist = doesExist;
module.exports.users = users;
