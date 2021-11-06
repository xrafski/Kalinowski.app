const express = require('express');
const mongoose = require('mongoose');
const { mongoURI, port } = require('./Settings/secret/info.json'); // Secret file
const logger = require('./Utils/logger');

const app = express();

// Middlewares
app.use(express.static('html'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Load some info about mongoDB connection
require('./Utils/mongodb')(app);
require('./Utils/process')(app);

// Importing routes
app.use('/', require('./Routes/auth'));
app.use('/threat', require('./Routes/threat'));
app.use('/certificate', require('./Routes/certificate'));
app.use('/mongo', require('./Routes/mongo'));

// Invalid route handler.
app.all('*', (req, res, next) => {
    // res.status(404).send({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server!`
    // });

    const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    err.status = 'fail';
    err.statusCode = 404;

    next(err);
});

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).send({
        status: err.status,
        message: err.message
    });
});

// Connect to MongoDB and start the app
mongoose.connect(mongoURI, {
    maxPoolSize: 15,
    keepAlive: true,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 5000,
})
    .then(db => { // If DB is connected start the app, else exit.
        if (db?.connection?.readyState === 1) {
            app.listen(port, () => logger.startup(`kalinowski.js (1) Express Server running on port '${port}'.`));
        } else { process.exit(1); }

    })
    .catch(err => {
        logger.mongo('kalinowski.js (2) Error on startup', err);
        process.exit(1); // Quit app on mongodb error.
    });