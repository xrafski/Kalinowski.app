const express = require('express');
const mongoose = require('mongoose');
const { mongoURI, port } = require('./Settings/secret/info.json'); // Secret file

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
app.use('/certification', require('./Routes/certification'));
app.use('/mongo', require('./Routes/mongo'));

// Connect to MongoDB and start app
mongoose.connect(mongoURI, {
    maxPoolSize: 10,
    keepAlive: true,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 10000,
})
    .then(db => { // If DB is connected start the app, else exit.
        if (db?.connection?.readyState === 1) {
            app.listen(port, () => { console.log(`Express Server running on port ${port}`); });
        } else { process.exit(1); }

    })
    .catch(err => {
        console.error(err);
        process.exit(1); // Quit app on mongodb error.
    });

// // Middleware
// app.use('/blacklist', () => {
//     console.log('This is middleware running');
// });