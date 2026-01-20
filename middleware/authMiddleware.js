const jwt_token = require('jsonwebtoken');
const helper = require('../helper/index');

const authMiddleware = {};

authMiddleware.isAuth = (req, res, next) => {
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(" ")[1];
            console.log('Token - ', token);
            jwt_token.verify(token, process.env.JWT_SECRET, (error, data) => {
                if (data) {
                    console.log('Decoded Data - ', data);
                    req.user = data;
                    next();
                } else {
                    return res.status(401).json(helper.response(401, false, "invalid Token!"));
                }
            });
        } else {
            return res.status(401).json(helper.response(401, false, "Please Enter Token"));
        }
    } catch (error) {
        return res.status(500).json(helper.response(500, false, "something went wrong!"));
    }
}



module.exports = authMiddleware;