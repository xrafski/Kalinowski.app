const { userModel } = require('../Schemas/User');
const { loginValidation } = require('./validation');
const bcrypt = require('bcryptjs');

module.exports = async function (req, res, next) {
    // Check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        console.warn(`[API] Unauthorized user with missing authorization header tried to use '${req.originalUrl}' route with '${req.method}' method.`);
        return res.status(401).json({ message: 'Missing Authorization Header' });
    }

    // Decode auth credentials
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    // Validate the data
    const { error } = loginValidation({ username, password });
    if (error) {
        console.warn(`[API] Unauthorized user '${username}' with invalid authorization header tried to use '${req.originalUrl}' route with '${req.method}' method.`);
        return res.status(400).send({ message: error.details[0].message });
    }

    // Find username in the database
    await userModel.findOne({ username, activated: true })
        .then(dbUser => {
            // Check if user exists
            if (!dbUser) {
                console.warn(`[API] Unknown unauthorized user '${username}' tried to use '${req.originalUrl}' route with '${req.method}' method.`);
                return res.status(401).send({ message: 'This user is not registered or activated.' });
            }

            // Assign userDB to req.user
            req.user = dbUser.username;

            // Check if password is correct
            const validPassword = bcrypt.compareSync(password, dbUser.password);
            if (!validPassword) {
                console.warn(`[API] Unauthorized user '${req.user}' with invalid password tried to use '${req.originalUrl}' route with '${req.method}' method.`);
                return res.status(401).json({ message: 'Invalid password.' });
            }

            // Console.info that event out.
            console.info(`[API] '${req.user}' used '${req.originalUrl}' route with '${req.method}' method.`);
            next(); // Go to next route.
        })
        .catch(err => {
            console.warn(`[API] MongoDB might be unavailable: '${err.message}'`);
            res.status(500).send({ message: 'MongoDB Server seems to be busy. Try again later.' });
        });
};