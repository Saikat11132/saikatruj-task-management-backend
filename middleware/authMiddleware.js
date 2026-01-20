const jwt_token = require('jsonwebtoken');
const helper = require('../helper/index');

const authMiddleware = {};

authMiddleware.isAuth = (req, res, next) => {
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(" ")[1];
            jwt_token.verify(token, process.env.JWT_SECRET, (error, data) => {
                if (data) {
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
authMiddleware.isAdmin = (req, res, next) => {
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(" ")[1];
            jwt_token.verify(token, process.env.JWT_SECRET, (error, data) => {
                if (data) {
                    if (data.isAdmin == 1) {
                        req.user = data;
                        next();
                    } else {
                        return res.status(401).json(helper.response(401, false, "your are not admin"));
                    }
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