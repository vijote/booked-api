// === import all the required packages ===
const express = require('express');
const {Book, Purchases} = require('../../db');
const { checkToken } = require('../middlewares');

// router definition
const router = express.Router();

router.get('/', async (req,res)=> { // get all the books
    const books = await Book.findAll();
    res.json(books);
});

router.post('/', async (req, res)=> { // post a new book
    const book = await Book.create(req.body);
    res.json(book);
});

router.get('/:bookId', async (req,res)=> { // get a specific book
    const book = await Book.findOne({where: {id: req.params.bookId}});
    if(book) res.json(book);
    else res.json({error: 'book not found!'});
});


router.put('/:bookId', async (req,res)=> { // update an existing book(not used yet)
    await Book.update(req.body, {
        where: {id: req.params.bookId}
    });
    res.json({success: 'Book updated correctly!'});
});

router.delete('/:bookId', async (req, res) => { // delete an existing book(not used yet)
    await Book.destroy({
        where: {id: req.params.bookId}
    });
    res.json({success: 'Book deleted succesfully!'});
});

// BOOK READING ROUTE
router.post('/read/:bookId', async (req,res) => {
    checkToken(req, res); // check if the session token is valid
    if(req.userId){ // if there is a userId means the token is valid
        // try to find the book with the provided id
        const book = await Book.findOne({where: {id: req.params.bookId}});
        if(book){ // if there is one
            res.send({success: book.file, user: req.userId}); // send the success message
        } else res.status(404); // else send an error
    } else res.json({error: 'You need to log in first!'}) // if there is no token send an error msg
});

// ROUTE FOR VERIFYING IF A USER PURCHASED A BOOK
router.post('/verify', async (req,res) => { // route used to verify purchase of the book
    const {userId, bookId} = req.body;
    if(userId && bookId){ // check if there are bookId and userId
        // try to find that purchase
        const result = await Purchases.findOne({where: {bookId: bookId, userId: userId}});
        if(result){
            // if there is a purchase, means the user is allowed to read it
            res.send({success: 'You purchased that book :)'}); // send a happy response
        } else res.status(404); // else send an angry error
    } else res.status(404); // if there are not userId and bookId, send another error
});

// ROUTE FOR SEEING ALL THE BOOKS THAT A USER HAS
router.post('/getBooks', async (req,res) => {
    const {userId} = req.body; // user id
    let books = []; // all the user's books will get here
    if(userId){ // check if there is a user id in the request
        // then find all the purchases made by this user
        const allPurchases = await Purchases.findAll({where: {userId: userId}});
        console.log('checking bought books...');
        for(book of allPurchases){
            // and search all the books of those purchases
            const currentBook = await Book.findOne({where: {id: book.bookId}});
            books.push(currentBook) // save them in the array
        }
        res.send(books); // and send it as response
    } else res.status(404); // if there is no user send an error
});

// exports an object
module.exports = router;