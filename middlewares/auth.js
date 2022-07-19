const { JsonWebTokenError } = require("jsonwebtoken");
const ApiError = require("../helpers/api-error");
const { verify } = require('../helpers/jwt-auth');

const authentication = (req, res, next) => {
    try {

        const headerToken = req.headers['authorization'];
        // console.log(headerToken);
        if (headerToken) {
            const token = headerToken.split(' ')[1];
            const payload = verify(token);
            // console.log(payload);
            req.user = payload;
            return next();
        }
        throw ApiError.badRequest('Token required!')
    }
    catch (error) {
        console.log(error.message);
        if (error instanceof JsonWebTokenError) {
            console.log('JsonWebTokenError:')
            next(ApiError.badRequest('Token = ' + error.message));
        }
        next(error)
    }
}

const authorization = (...roles) => (req, res, next) => {
    console.log(req.user.role)
    console.log(roles)
    if (roles.includes(req.user.role)) {
        next();
    } else {
        next(ApiError.forbidden('You are not authorized to access this resource'));
    }
}


module.exports = {
    authentication,
    authorization
}