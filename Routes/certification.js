const express = require('express');
const { certificationModel } = require('../Schemas/certificationCollection');
const router = express.Router();
const basicVerify = require('../Utils/basicVerify');

router.get('/:guild', basicVerify, async (req, res) => {
    try {
        const query = { $or: [{ club: { $regex: req.params.guild, $options: 'i' } }, { 'discord.id': { $regex: req.params.guild, $options: 'i' } }] };
        const dbGuild = await certificationModel.findOne(query);
        res.status(200).send(dbGuild);
    } catch (error) {
        res.status(400).send({ message: error });
    }
});

module.exports = router;