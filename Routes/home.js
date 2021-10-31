const express = require('express');
const router = express.Router();

// router domain/

router.get('/', async (req, res) => {
    res.status(200).send('Home route');
});

router.get('/register', async (req, res) => {
    res.status(200).send('Home register route');
});

router.get('/login', async (req, res) => {
    res.status(200).send('Home login route');
});

module.exports = router;