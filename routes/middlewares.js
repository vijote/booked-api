const jwt = require('jwt-simple');
const moment = require('moment');

const checkToken = (req,res,next) => {
    if(!req.headers['user-token']){
        return res.json({error: 'User token is required!'});
    }

    const userToken = req.headers['user-token'];
    let payload = {};
    
    try {
        payload = jwt.decode(userToken, 'ultra secret phrase');
    } catch (error) {
        return res.json({error: 'Invalid token!'});
    }

    if(payload.expiredAt < moment().unix()) {
        return res.json({error: 'Expired token!'});
    }

    req.userId = payload.userId;

    next();
}

module.exports = {
    checkToken
};