// === import necessary packages ===
const express = require('express');
const apiRouter = require('./routes/api');
const cors = require('cors');

// === creation of the app and setup ===
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);

// === startup ===

app.listen(port, ()=> {
    console.log('server running!');
});