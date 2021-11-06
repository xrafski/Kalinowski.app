const { mongoUser } = require('../Models/User');
const { loginValidation } = require('./validation');
const bcrypt = require('bcryptjs');
const logger = require('./logger');

module.exports = async function (req, res, next) {
    // Check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        logger.api(`Utils/basicVerify.js (1) Unauthorized user with missing authorization header tried to use '${req.method}' '${req.originalUrl}'.`);
        return res.status(401).send({ message: 'Missing Authorization Header' });
    }

    // Decode auth credentials
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    // Validate the data
    const { error } = loginValidation({ username, password });
    if (error) {
        logger.api(`Utils/basicVerify.js (2) Unauthorized user '${username}' with invalid authorization header tried to use '${req.method}' '${req.originalUrl}'.`);
        return res.status(400).send({ message: error.details[0].message });
    }

    // Find username in the database
    await mongoUser.findOne({ username, activated: true })
        .then(dbUser => {
            // Check if user exists
            if (!dbUser) {
                logger.api(`Utils/basicVerify.js (3) Not activated user '${username}' tried to use '${req.method}' '${req.originalUrl}'.`);
                return res.status(401).send({ message: 'This user is not registered or activated.' });
            }

            // Assign userDB to req.user
            req.user = dbUser.username;

            // Check if password is correct
            const validPassword = bcrypt.compareSync(password, dbUser.password);
            if (!validPassword) {
                logger.api(`Utils/basicVerify.js (4) User '${req.user}' with invalid password tried to use '${req.method}' '${req.originalUrl}'.`);
                return res.status(401).json({ message: 'Invalid password.' });
            }

            // Log that event out.
            logger.api(`Utils/basicVerify.js (5) '${req.user}' used '${req.method}' '${req.originalUrl}'.`);
            next(); // Go to next route.
        })
        .catch(err => {
            logger.api('Utils/basicVerify.js (6) MongoDB might be unavailable', err);
            res.status(500).send({ message: 'MongoDB Server seems to be busy. Try again later.' });
        });
};