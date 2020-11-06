const express = require('express');
const apiBooksRouter = require('./api/books');
const apiUsersRouter = require('./api/users');
const middleware = require('./middlewares');

const router = express.Router();

router.use('/books', middleware.checkToken, apiBooksRouter);
router.use('/users', apiUsersRouter);
router.get('/index', (req,res) => {
    res.send('welcome to my super api!!!');
});

router.post('/buy/:bookId', async (req, res) => {
    console.log(req.params);
    try{
        const book = await Book.buyBook(req.params.bookId, req.userId);
        res.json({msg: 'successfully buyed!', ...book});
    } catch(error){
        res.json({error: 'Error buying your book!'});
    }
});

module.exports = router;