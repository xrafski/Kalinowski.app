const express = require('express');
const { mongoUser } = require('../Models/User');
const { registerValidation, loginValidation } = require('../Utils/validation');
const router = express.Router();
const bcrypt = require('bcryptjs');
const path = require('path');
const logger = require('../Utils/logger');

router.get('/', async (req, res) => {
    res.status(200).send('Home route');
});

router.get('/register', (req, res) => {
    res.status(200).sendFile(path.join(__dirname + '/../html/register.html'));
});

router.post('/register', async (req, res) => {
    // Validate the data
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    // Check mongoDB for this username
    await mongoUser.findOne({ username: req.body.username })
        .then(async dbUser => {
            // Check if user is found
            if (dbUser) return res.status(400).send({ message: 'This user is already registered!' });

            // Hash the password
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.password, salt);

            // Create a new user document
            const newUser = new mongoUser({
                username: req.body.username,
                password: hash
            });

            try {
                const savedUser = await newUser.save();
                logger.api(`Routes/auth.js (1) Registered a new user '${savedUser.username}' to the API server.`);
                res.status(200).send({ message: `User '${savedUser.username}' registered successfully, but not activated yet.` });
            } catch (err) {
                res.status(400).send({ message: err.toString() });
            }
        })
        .catch(err => res.status(400).send({ message: err.toString() }));
});

router.get('/login', (req, res) => {
    res.status(200).sendFile(path.join(__dirname + '/../html/login.html'));
});

router.post('/login', async (req, res) => {
    // Validate the data
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    // Check mongoDB for this username
    await mongoUser.findOne({ username: req.body.username, activated: true })
        .then(dbUser => {
            // Check if user is found
            if (!dbUser) return res.status(401).send({ message: 'This user is not registered or activated.' });

            // Check if password is correct
            const validPassword = bcrypt.compareSync(req.body.password, dbUser.password);
            if (!validPassword) return res.status(401).send({ message: 'Invalid password.' });

            // If all above passed then return a status 200 message.
            res.status(200).send({ message: 'This user is registered and activated with those credentials.' });
            logger.api(`Routes/auth.js (2) User '${dbUser.username}' logged in successfully.`);
        })
        .catch(err => res.status(400).send({ message: err.toString() }));
});

module.exports = router;