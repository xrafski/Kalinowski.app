const express = require('express');
const { userModel } = require('../Schemas/User');
const { registerValidation, loginValidation } = require('../Utils/validation');
const router = express.Router();
const bcrypt = require('bcryptjs');
const path = require('path');

router.get('/', async (req, res) => {
    res.status(200).send('Home route');
});

router.get('/register', (req, res) => {
    res.status(200).sendFile(path.join(__dirname + '/../html/register.html'));
});

router.post('/register', async (req, res) => {
    // Validate the data
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Check if user is already registered
    const userExist = await userModel.findOne({ username: req.body.username });
    if (userExist) return res.status(400).send('This user is already registered!');

    // Hash the password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    // Create a new user
    const user = new userModel({
        username: req.body.username,
        password: hash
    });

    try {
        const savedUser = await user.save();
        res.status(200).send(`User '${savedUser.username}' registered successfully.\nNOTE: Accout is not activated and you can't use API yet.\nWait for approval  from Skillez.`);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.get('/login', (req, res) => {
    res.status(200).sendFile(path.join(__dirname + '/../html/login.html'));
});

router.post('/login', async (req, res) => {
    // Validate the data
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Check if user exists
    const dbUser = await userModel.findOne({ username: req.body.username, activated: true });
    if (!dbUser) return res.status(401).send('This user is not registered or activated.');

    // Check if password is correct
    const validPassword = bcrypt.compareSync(req.body.password, dbUser.password);
    if (!validPassword) return res.status(401).send('Invalid password.');

    res.status(200).send('This user is registered and activated with those credentials.\nFeel free to use API now.');
});

module.exports = router;