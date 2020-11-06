const express = require('express');
const {Book} = require('../../db');
const router = express.Router();


router.get('/', async (req,res)=> {
    const books = await Book.findAll();
    res.json(books);
});

router.post('/', async (req, res)=> {
    const book = await Book.create(req.body);
    res.json(book);
});

router.put('/:bookId', async (req,res)=> {
    await Book.update(req.body, {
        where: {id: req.params.bookId}
    });
    res.json({success: 'Book updated correctly!'});
});

router.delete('/:bookId', async (req, res) => {
    await Book.destroy({
        where: {id: req.params.bookId}
    });
    res.json({success: 'Book deleted succesfully!'});
});

module.exports = router;