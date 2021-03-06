const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) { // sent token from bearar token form the header
        token = req.headers.authorization.split(' ')[1];
    }
    // sent token from cookie
    // esle if(req.cookies.token){
    //     token=req.cookies.token;
    // }

    // make sure token is sent or exists
    if (! token) {
        return next(new ErrorResponse('NOT AUTHORIZE TO ACCESS THIS ROUTE', 401));
    }
    try { // verift token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);

        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        return next(new ErrorResponse('NOT AUTHORIZE TO ACCESS THIS ROUTE', 401));
    }
});

// grant access to specific roles
exports.authorize = (...roles) => {
    return(req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role ${
                req.user.role
            } is not authorized to access this route`, 403));
        }

        next();
    };
};
