const ErrorResponse = require('../utils/errorResponse');


const errorHandler = (err, req, res, next) => {
    let error = {
        ...err
    };
    error.message = err.message;
    // log to console for dev
    console.log(err);

    // mongoose bad id request
    if (err.name == 'CastError') {
        const message = `bootcamp not found with th id ${
            err.value
        }`;
        error = new ErrorResponse(message, 404);
    }
    // mongoose duplicate field value  error
    if (err.code == 11000) {
        const message = 'duplicate field value entered ';
        error = new ErrorResponse(message, 400);
    }
    // mongoose validaton error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorRespponse(message, 400);
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'server error'
    });

}
module.exports = errorHandler;
