const express = require('express');
const { threatModel } = require('../Schemas/threatCollection');
const router = express.Router();
const basicVerify = require('../Utils/basicVerify');
router.get('/', basicVerify, async (req, res) => {

    try {
        const list = await threatModel.find().limit(500);
        res.send(list);
    } catch (error) {
        res.send({ message: error });
    }
});

router.get('/:user', basicVerify, async (req, res) => {
    try {
        const query = { $or: [{ name: { $regex: req.params.user, $options: 'i' } }, { alternates: { $regex: req.params.user, $options: 'i' } }, { discord: { $regex: req.params.user, $options: 'i' } }] };
        const dbUser = await threatModel.findOne(query);
        res.json(dbUser);
    } catch (error) {
        res.send({ message: error });
    }
});

module.exports = router;