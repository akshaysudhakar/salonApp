const jwt = require('jsonwebtoken');

require('dotenv').config()
const secret_key = process.env.USERID_SECRET_KEY;


exports.generateToken =(id,email)=>{
    const payload = {
        id : id ,
        email : email,
    }
    return jwt.sign(payload,secret_key)
}