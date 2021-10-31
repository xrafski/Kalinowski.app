const express = require('express');
const { threatModel } = require('../Schemas/threatCollection');
const router = express.Router();

// router domain/blacklist

router.get('/', async (req, res) => {
    console.log(req.body);

    try {
        const list = await threatModel.find().limit(50);
        res.send(list);
    } catch (error) {
        res.send({ message: error });
    }
});

router.get('/:user', async (req, res) => {
    try {
        const query = { $or: [{ name: { $regex: req.params.user, $options: 'i' } }, { alternates: { $regex: req.params.user, $options: 'i' } }, { discord: { $regex: req.params.user, $options: 'i' } }] };
        const list = await threatModel.findOne(query);
        res.json(list);
    } catch (error) {
        res.send({ message: error });
    }
});

module.exports = router;