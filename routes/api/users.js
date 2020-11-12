// === import of all required packages ===
const express = require('express');
const bcrypt = require('bcryptjs');
const {User, Book} = require('../../db');
const {check, validationResult} = require('express-validator');
const jwt = require('jwt-simple');
const moment = require('moment');
const router = express.Router();
const nodemailer = require("nodemailer");
const { checkToken } = require('../middlewares');
const { v4: uuid } = require('uuid');

// REGISTER ROUTE
router.post('/register', [ // middlewares to check if all fields are valid(only used in the first moments of the project)
    check('email', 'Please enter a valid email!').isEmail(),
    check('password', 'Password is required!').not().isEmpty()
], async (req,res)=> {
    // check if there is an already registered user with that email
    const user = await User.findOne({where: {email : req.body.email}});

    if(!user){
        // if there isn't, check if there are books to buy
        if (req.body.books){
            req.body.books = JSON.parse(req.body.books)
            const errors = validationResult(req); 
            if(!errors.isEmpty()) { // check if there are errors, and send them
                return res.status(422).json({errors: errors.array()});
            }
            req.body.password = await bcrypt.hash(req.body.password, 10); // 10 times will be encripted
            const user = await User.create(req.body); // after all checks done, create the user
            for(book of req.body.books){ // and buy all the books, storing them in the table
                await Book.buyBook(book.id,user.id);
            }
            res.json(user); // finally send a very happy message
    
        } else {
            // if there are no books
            res.status(403).json({error: 'You can register only after buying a book'});
        }
    // if there is already an account with that email
    } else res.status(403).json({error: 'There is an account already registered with that email!'});
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
    // try to find a user with the email provided
    const user = await User.findOne({ where: {email: req.body.email} });
    if(user){
        // if there is one, check its password
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if(passwordMatch){
            // if the password is correct, create the token for the 'session'
            res.json({success: createSessionToken(user)});
        } else{
            // if the password is invalid, do not give specific info, for possible attackers
            res.json({error: 'Username or password is invalid!'});
        }
    } else{
        // same here, not specific info, for possible attackers
        res.json({error: 'Username or password is invalid!'});
    }
});

// ROUTE FOR SENDING EMAILS
router.post('/sendEmail', async (req,res) => {
    // check if there is an account with the provided email
    const user = await User.findOne({ where: {email: req.body.email} });
    if(user){
        // if there is a user with that email, prepare to send the email
        // create transporter and set it to use gmail acc
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'juanemailer@gmail.com',
              pass: 'JuanSend1'
            }
          });
          
        // create the specific message, from who, to who, subject and content
        const mailOptions = {
            from: 'juanemailer@gmail.com',
            to: req.body.email,
            subject: 'Password recovery',
            text: `please go to https://booked-spa.herokuapp.com/#/newpassword/${createPassRecToken(user)}`
            // the text or body of the msg contains the link with the token for password change
        };
        
        // after all the configuration, send the email
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                res.send({success: `email sent to ${info.response}`});
            }
        });
    } else{
        // if there is not an account with that email
        res.json({error: 'The email provided is not registered!'});
    }
});

// PASSWORD RECOVERY ROUTE
router.post('/recover/:token', async (req,res) => {
    // token validation
    const token = req.params.token; // provided token
    let payload = {}; // this object will be filled with the encryped data
    
    try {
        payload = jwt.decode(token, 'ultra secret password'); // get the data from the token
    } catch (error) {
        // if token is not valid
        return res.json({error: 'Invalid token!'});
    }

    if(payload.expiredAt < moment().unix()) {
        // or expired
        return res.json({error: 'Expired token!'});
    }

    // user validation
    try{
        // verify if user with that email exists
        const user = await User.findOne({ where: payload.email });
        if(user){
            // if exists, encrypt the new password and save it
            req.body.password = await bcrypt.hash(req.body.password, 10);
            await user.update({password: req.body.password});
            res.json({success: 'Password updated successfully!'});
        }
    } catch(error){
        // if user not found
        res.send({error:'Email not valid!'});
    }
});

// SESSION CHECK ROUTE
router.post('/checkSession', async (req,res) => {
    checkToken(req,res); // function to check the token
    if(req.userId){ // if there is a user id
        // try to find a user with that id
        const user = await User.findOne({where: {id: req.userId}});
        if(user){ // if there is a user with that id
            res.send({success: req.userId}); // send its id
        } else res.status(404); // else send an error
    }
});

// ROUTE FOR VERIFICATION OF THE DEVICE
router.post('/checkDevice', async (req, res) => {
    // if there is a device id in the request
    if(req.body.userDevice){
        //try to find that user with that device
        const user = await User.findOne({where: {device: req.body.userDevice}});
        if(user){ // if there is one
            console.log('user found!');
            res.send({success: user.device}); // send the device id as response(or could be anything else)
        } else res.status(404).send('User not found!'); // else send an error
    } else res.status(403); // if there is no device id send an error
});

const createSessionToken = (user) => { // here the 'session' token is created
    const payload = { // this object will contain the following data:
        userId: user.id, // user id
        createdAt: moment().unix(), // current time
        expiredAt: moment().add(1, 'days').unix() // create a token that's valid for 1 day
    }
    return jwt.encode(payload, 'ultra secret phrase'); // encode the object and send it as token
}

const createPassRecToken = (email) => { // here the token for the password recovery is created
    const payload = { // same as before, this object will be encoded and will contain:
        email, // user email
        createdAt: moment().unix(), // current time
        expiredAt: moment().add(1, 'hours').unix() // create a token that's valid  for 1 hour
    }
    return jwt.encode(payload, 'ultra secret password'); // again, return the object encoded
}

// exports the router object
module.exports = router;