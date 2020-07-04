const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

//Security
const reateLimit=require('express-rate-limit')

// Load env vars
dotenv.config({ path: './config/.env' });

// Connect to database
connectDB();

// load Routers
const tours = require('./routes/tours');
const auth = require('./routes/auth');
const users = require('./routes/user');
const rateLimit = require('express-rate-limit');


const app = express();
// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
// Global Middleware
const Limitter=rateLimit({
    max:100,
    window:60*60*1000,
    message:"Too many requests with same IP please try again after one hour"
});
app.use('/api',Limitter);

// Mount routers
app.use('/api/v1/tours', tours);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);

// Handle 404 requests
app.all('*', (req, res, next) => {
    res.status(404).json({
        success: false,
        msg: `Cannot find this ${req.originalUrl} on server`
    })
});


// errorHandler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // Close server & exit process
    server.close(() => process.exit(1));
});
