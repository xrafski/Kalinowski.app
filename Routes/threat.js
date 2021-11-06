const express = require('express');
const { mongoThreat } = require('../Models/Threat');
const router = express.Router();
const basicVerify = require('../Utils/basicVerify');
router.get('/', basicVerify, async (req, res) => {

    try {
        const list = await mongoThreat.find().limit(500); // List up to 500 results.
        res.status(200).json(list);
    } catch (error) {
        res.status(500).send({ message: error.toString() });
    }
});

router.get('/:user', basicVerify, async (req, res) => {
    try {
        const query = { $or: [{ name: { $regex: req.params.user, $options: 'i' } }, { alternates: { $regex: req.params.user, $options: 'i' } }, { discord: { $regex: req.params.user, $options: 'i' } }] };
        const dbUser = await mongoThreat.findOne(query);
        res.status(200).json(dbUser);
    } catch (error) {
        res.status(500).send({ message: error.toString() });
    }
});

module.exports = router;