const express = require('express');
const bcrypt = require('bcryptjs');
const {User} = require('../../db');
const {check, validationResult} = require('express-validator');
const jwt = require('jwt-simple');
const moment = require('moment');
const router = express.Router();
const nodemailer = require("nodemailer");

router.post('/register', [
    check('email', 'Please enter a valid email!').isEmail(),
    check('password', 'Password is required!').not().isEmpty()
], async (req,res)=> {
    if (req.body.bookId){
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }
        req.body.password = await bcrypt.hash(req.body.password, 10); // 10 times will be encripted
        const user = await User.create(req.body);
        res.json(user);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'juanemailer@gmail.com',
              pass: 'JuanSend1' // naturally, replace both with your real credentials or an application-specific password
            }
          });
          
          const mailOptions = {
            from: 'juanemailer@gmail.com',
            to: 'juanignaciodom3@gmail.com',
            subject: 'Testing',
            text: 'Dudes, we really need your money.'
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

    } else {
        res.json({error: 'You can register only after buying a book'});
    }
});

router.post('/login', async (req, res) => {
    const user = await User.findOne({ where: {email: req.body.email} });
    if(user){
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if(passwordMatch){
            res.json({success: createToken(user)});
        } else{
            res.json({error: 'Username or password is invalid!'});
        }
    } else{
        res.json({error: 'Username or password is invalid!'});
    }
});

const createToken = (user) => {
    const payload = {
        userId: user.id,
        createdAt: moment().unix(),
        expiredAt: moment().add(5, 'minutes').unix()
    }
    return jwt.encode(payload, 'ultra secret phrase');
}

module.exports = router;