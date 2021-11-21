const express = require('express');
const { mongoCertificate } = require('../Models/Certificates');
const router = express.Router();
const basicVerify = require('../Utils/basicVerify');

// List all certificates.
router.get('/', basicVerify, async (req, res) => {
    try {
        const dbGuild = await mongoCertificate.find({});
        res.status(200).send(dbGuild);
    } catch (error) {
        res.status(500).send({ message: error.toString() });
    }
});

// List a specific certificate.
router.get('/:guild', basicVerify, async (req, res) => {
    try {
        const query = { $or: [{ club: { $regex: req.params.guild, $options: 'i' } }, { 'discord.id': { $regex: req.params.guild, $options: 'i' } }] };
        const dbGuild = await mongoCertificate.findOne(query);
        res.status(200).send(dbGuild);
    } catch (error) {
        res.status(500).send({ message: error.toString() });
    }
});

module.exports = router;