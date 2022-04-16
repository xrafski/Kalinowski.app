const express = require('express');
const { mongoCodes } = require('../Models/Code');
const router = express.Router();
const basicVerify = require('../Utils/basicVerify');
const sanitize = require('mongo-sanitize');

// Create a new code.
router.post('/create', basicVerify, async (req, res) => {

    const dataFormat = { // Set data format for a new document.
        identifier: req.body.identifier, // Combined Discord Server ID with code string. // Example: '739519144344551497-tea1234', '131810843686993921-mycoolcode129387' etc.
        code: req.body.code, // Code that people need to use.
        server: req.body.server, // Discord server ID.
        hint: req.body.hint, // Hint for people.
        prize: req.body.prize, // Prize associated with the code.
        claimed: false, // Whether the code is clamed.
    };

    // Create MongoDB document.
    const newCodeDocument = new mongoCodes(dataFormat);

    // Insert document to the database.
    await mongoCodes.create(newCodeDocument)
        .then(code => res.status(201).json(code))
        .catch(err => { // Error handler for MongoDB query.
            if (err.code === 11000) return res.status(400).send({ message: 'Duplicate key found. This code already exists, please check its status with \'**/code check**\' command.' });
            if (err.name === 'ValidationError') return res.status(406).send({ message: err.message });
            res.status(500).send({ message: err.message });
        });

});

// Get a specific document from the database.
router.get('/check/:server/:code', basicVerify, async (req, res) => {
    const { server, code } = req.params;

    await mongoCodes.findOne({ identifier: `${server}-${sanitize(code)}` })
        .then(document => {
            res.status(200).json(document); // Response when the document is received successfully or null.
        })
        .catch(err => res.status(500).send({ message: err.message })); // Error handler for MongoDB query.
});

// Remove a specific document from the database.
router.delete('/remove/:server/:code', basicVerify, async (req, res) => {
    const { server, code } = req.params;

    await mongoCodes.findOneAndDelete({ identifier: `${server}-${sanitize(code)}` })
        .then(document => res.status(200).json(document)) // Response when the document is removed successfully or null.
        .catch(err => res.status(500).send({ message: err.message })); // Error handler for MongoDB query.
});

// Count documents for specific server.
router.get('/count/:server', basicVerify, async (req, res) => {
    const { server } = req.params;

    await mongoCodes.count({ server })
        .then(count => res.status(200).json(count)) // Integer with amount of documents found.
        .catch(err => res.status(500).send({ message: err.message }));
});

// Get a specific list of documents from the database.
router.get('/list/:type/:server', basicVerify, (req, res) => {
    const { type, server } = req.params;

    // Switch with different types of list requests.
    switch (type) {
        case 'all': return getList({ server }, 'claimed code updatedAt winner');
        case 'claimed': return getList({ server, claimed: true }, 'claimed code updatedAt winner');
        case 'unclaimed': return getList({ server, claimed: false }, 'claimed code updatedAt');
        case 'remaining': return getList({ server }, 'claimed code hint updatedAt winner');
        default: return res.status(404).send({ message: 'Unknown requested path.' });
    }

    async function getList(query, projection) {
        await mongoCodes.find(query, projection)
            .then(documents => res.status(200).json(documents)) // Response when the document is received successfully or empty object.
            .catch(err => res.status(500).send({ message: err.message })); // Error handler for MongoDB query.
    }
});

// Claim the code
router.patch('/claim/:server/:code', basicVerify, async (req, res) => {
    const { server, code } = req.params;

    // await mongoCodes.updateOne({ identifier: `${server}-${sanitize(code)}` }, { claimed: true, winner: { id: req.body.id, tag: req.body.tag } });
    // User.find({ $or: [{ identifier: `${server}-${sanitize(code)}` }, { identifier: `551785335638589451-${sanitize(code)}` }] },
    // Find a specific document from the database.
    await mongoCodes.findOne({ identifier: `${server}-${sanitize(code)}` })
        .then(async docFound => {

            // Check doesnt exist and return message if so.
            if (!docFound) return res.status(200).json({ message: 'code_invalid' });


            // Check if document is claimed and return message object with 'already_claimed' and some data about the claim.
            if (docFound.claimed === true) {
                return res.status(200).json({ message: 'code_claimed', updatedAt: docFound.updatedAt, winner: { id: docFound.winner.id, tag: docFound.winner.tag } });
            }

            // Modify the document.
            docFound.claimed = true;
            docFound.winner.id = req.body.id;
            docFound.winner.tag = req.body.tag;

            // Save the document changes.
            await docFound.save().catch(err => res.status(500).send({ message: err.message }));

            // Send response
            res.status(200).send({ message: 'claim_success', document: docFound });
        })
        .catch(err => res.status(500).send({ message: err.message })); // Error handler for MongoDB query.
});

module.exports = router;