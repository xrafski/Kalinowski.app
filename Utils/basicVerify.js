const { userModel } = require('../Schemas/user');
const { loginValidation } = require('./validation');
const bcrypt = require('bcryptjs');

module.exports = async function (req, res, next) {

    // Check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).json({ message: 'Missing Authorization Header' });
    }

    // verify auth credentials
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    // validate the data
    const { error } = loginValidation({ username, password });
    if (error) return res.status(400).send({ error: error.details[0].message });

    // Check if user exists
    const dbUser = await userModel.findOne({ username, activated: true });
    if (!dbUser) return res.status(401).send({ error: 'This user is not registered or activated.' });

    // Check if password is correct
    const validPassword = bcrypt.compareSync(password, dbUser.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid password.' });

    // Assign userDB doc to req.user
    req.user = dbUser._doc;
    next();
};