// === import of the necessary packages === 
const jwt = require('jwt-simple');
const moment = require('moment');

// === check if the token is present, and is valid ===
const checkToken = (req, res) => {
    if(!req.body.token){
        return res.json({error: 'User token is required!'});
    }

    const userToken = req.body.token;
    let payload = {}; // object which will contain the encrypted data
    
    try {
        // try to decode the token and get the data, if it's valid
        payload = jwt.decode(userToken, 'ultra secret phrase');
    } catch (error) {
        // if the previous operation is not possible, it will throw an error
        return res.json({error: 'Invalid token!'});
    }

    if(payload.expiredAt < moment().unix()) {
        // maybe the operation did well, but the token is expired, and also is not valid
        return res.json({error: 'Expired token!'});
    }

    // if all went well, we get a valid 'session' token
    req.userId = payload.userId;
}

// exports an object
module.exports = {
    checkToken
};