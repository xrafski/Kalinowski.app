const jwt = require('jsonwebtoken');
const { jtwSecret } = require('../Settings/secret/info.json'); // Secret file

module.exports = function (req, res, next) {
    const token = req.header('kali-token');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token, jtwSecret);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).send('Invalid credentials');
    }
};