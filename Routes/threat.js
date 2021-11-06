const express = require('express');
const { mongoThreat } = require('../Models/Threat');
const router = express.Router();
const basicVerify = require('../Utils/basicVerify');
router.get('/', basicVerify, async (req, res) => {

    try {
        const list = await mongoThreat.find().limit(500); // List up to 500 results.
        res.send({ message: 'MongoDB Query success.', data: list });
    } catch (error) {
        res.send({ message: error.toString() });
    }
});

router.get('/:user', basicVerify, async (req, res) => {
    try {
        const query = { $or: [{ name: { $regex: req.params.user, $options: 'i' } }, { alternates: { $regex: req.params.user, $options: 'i' } }, { discord: { $regex: req.params.user, $options: 'i' } }] };
        const dbUser = await mongoThreat.findOne(query);
        res.json({ message: 'MongoDB Query success.', data: dbUser });
    } catch (error) {
        res.send({ message: error.toString() });
    }
});

module.exports = router;