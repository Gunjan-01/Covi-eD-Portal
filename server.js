const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const errorHandler = require('./middleware/error');
const bootcamps = require('./routes/bootcamps.js');
const connectdB = require('./config/dB');

// load env variables
dotenv.config({path: './config/config.env'});


// const {resolve} = require('path')
// require('dotenv').config({path: resolve(__dirname,"../../config/config.env")})

// connect to database
connectdB();

// route files

const courses = require('./routes/courses.js');

const app = express();

// body parser
app.use(express.json());

// dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

require('./models/Bootcamp');
require('./models/Course');

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`server is running on ${
    process.env.NODE_ENV
} mode on port ${PORT}`));

// handle unhandled promise rejections
process.on('unhandledRejection', (err, Promise) => {
    console.log(`error:${
        err.message
    }`);
    // close server and exit
    server.close(() => process.exit(1));
});
