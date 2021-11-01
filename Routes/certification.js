const express = require('express');
const { certificationModel } = require('../Schemas/certificationCollection');
const router = express.Router();
const basicVerify = require('../Utils/basicVerify');

router.get('/:guild', basicVerify, async (req, res) => {
    try {
        const query = { $or: [{ club: { $regex: req.params.guild, $options: 'i' } }, { 'discord.id': { $regex: req.params.guild, $options: 'i' } }] };
        const dbGuild = await certificationModel.findOne(query);
        res.json(dbGuild);
    } catch (error) {
        res.send({ message: error });
    }
});

router.get('/', basicVerify, async (req, res) => {
    res.status(404).send({ message: 'Unused route' });
});

module.exports = router;