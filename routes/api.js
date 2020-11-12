// === import necessary packages ===
const express = require('express');
const apiBooksRouter = require('./api/books');
const apiUsersRouter = require('./api/users');

// === setup of the routes ===
const router = express.Router();

router.use('/books', apiBooksRouter); // when the url matches '/api/books' this module will be executed 
router.use('/users', apiUsersRouter); // same here with '/api/users'
router.get('/index', (req,res) => { // index (only for testing purposes)
    res.send('welcome to my super api!!!');
});

module.exports = router;