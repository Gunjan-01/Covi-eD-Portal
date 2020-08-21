const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const swaggerdoc=require('swagger-jsdoc');
const swaggerUi=require('swagger-ui-express');
const errorHandler = require('./middleware/error');
const connectdB = require('./config/dB');

// load env variables
dotenv.config({ path: './config/config.env' });

// const {resolve} = require('path')
// require('dotenv').config({path: resolve(__dirname,"../../config/config.env")})

// connect to database
connectdB();

// route files
const bootcamps = require('./routes/bootcamps.js');
const courses = require('./routes/courses.js');
const auth = require('./routes/auth.js');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

// body parser
app.use(express.json());

// cookie parser
app.use(cookieParser());

// dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File-upload
app.use(fileupload());

//sanitize data
app.use(mongoSanitize());

//set security headers
app.use(helmet());

//prevent xss attacks
app.use(xss());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10 minutes
  max: 100,
});
app.use(limiter);
// prevent http param pollution
app.use(hpp());
// enable cors
app.use(cors());

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

require('./models/Bootcamp');
require('./models/Course');

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `server is running on ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);

// handle unhandled promise rejections
process.on('unhandledRejection', (err, Promise) => {
  console.log(`error:${err.message}`);
  // close server and exit
  server.close(() => process.exit(1));
});
