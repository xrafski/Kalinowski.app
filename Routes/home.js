const express = require('express');
const router = express.Router();

// router domain/

router.get('/', async (req, res) => {
    console.log(req.body);

    res.status(200).send('Hellow o.o');
});

module.exports = router;