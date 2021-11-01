const express = require('express');
const mongoose = require('mongoose');
const { mongoURI, port } = require('./Settings/secret/info.json'); // Secret file

const app = express();

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(express.json());

// Load some info about mongoDB connection
require('./Utils/mongodb')(app);
require('./Utils/process')(app);

// Importing routes
const blacklistRoute = require('./Routes/blacklist');
const authRoute = require('./Routes/auth');

app.use('/', authRoute);
app.use('/blacklist', blacklistRoute);

// Connect to MongoDB and start app
mongoose.connect(mongoURI, {
    maxPoolSize: 10,
    keepAlive: true,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 10000,
})
    .then(db => {
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