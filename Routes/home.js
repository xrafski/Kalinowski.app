const express = require('express');
const { userModel } = require('../Schemas/user');
const { registerValidation, loginValidation } = require('../Utils/validation');
const router = express.Router();
const bcrypt = require('bcryptjs');

// router domain/


router.get('/', async (req, res) => {
    res.status(200).send('Home route');
});

router.post('/register', async (req, res) => {
    // Validate the data
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Check if user is already registered
    const userExist = await userModel.findOne({ username: req.body.username });
    if (userExist) return res.status(400).send('This user is already registered');

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
        res.status(200).send(`User '${savedUser.username}' registered successfully.`);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post('/login', async (req, res) => {
    // Validate the data
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Check if user exists
    const dbUser = await userModel.findOne({ username: req.body.username, activated: true });
    if (!dbUser) return res.status(400).send('This user is not registered or activated.');

    // Check if password is correct
    const validPassword = bcrypt.compareSync(req.body.password, dbUser.password);
    if (!validPassword) return res.status(400).send('Invalid password.');

    res.status(200).send('Logged in');
});

module.exports = router;