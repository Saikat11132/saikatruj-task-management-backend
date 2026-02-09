
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

let common = {};

common.generateToken = async () => {
    const token = await crypto.randomBytes(32).toString('hex');
    const date = new Date();

    const newToken = date.toString().replace(/\s/g, '') + token; //Replace spaces

    return newToken;
}

common.signToken = (data) => {
    const secretKey = process.env.JWT_SECRET;
    // console.log("Data ==> ", data, " Secret Key ==>", secretKey);
    return jwt.sign(data, secretKey, { expiresIn: '1h' }); // Set appropriate expiration time
}
module.exports = common;