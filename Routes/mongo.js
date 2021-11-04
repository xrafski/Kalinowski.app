const express = require('express');
const { certificationModel } = require('../Schemas/certificationCollection'); // Mongo Certification Model
const { threatModel } = require('../Schemas/threatCollection'); // Mongo Threat Model
const router = express.Router(); // Express router
const basicVerify = require('../Utils/basicVerify'); // Express middleware to auth users
const { google } = require('googleapis'); // Google API access
const googleSheet = require('../Settings/google.json'); // Spreadsheet settings data
const serviceAccount = require('../Settings/secret/trove-ethics-alliance-service-account.json'); // Secret file with google service access


router.put('/certification', basicVerify, async (req, res) => { // URL/mongo/certification
    getSpreadSheetData(googleSheet.spreadsheet.clubRoster.id, googleSheet.spreadsheet.clubRoster.range, serviceAccount) // Get required data from the spreadsheet.
        .then(gData => {
            formatAndInsertCertificationData(gData) // Format received gData for Mongo.
                .then(data => res.status(200).send({ message: 'Certification data successfully replaced.', data }))
                .catch(error => res.status(400).send({ message: error.toString() }));
        })
        .catch(error => res.status(400).send({ message: error.toString() }));
});

router.put('/threat', basicVerify, async (req, res) => { // URL/mongo/threat
    getSpreadSheetData(googleSheet.spreadsheet.threatList.id, googleSheet.spreadsheet.threatList.range, serviceAccount) // Get required data from spreadsheet.
        .then(gData => {
            formatAndInsertThreatData(gData) // Format received gData for Mongo.
                .then(data => res.status(200).send({ message: 'Threat data successfully replaced.', data }))
                .catch(error => res.status(400).send({ message: error.toString() }));
        })
        .catch(error => res.status(400).send({ message: error.toString() }));
});

/**
 * Get data from the google spreadsheet service.
 * @param {String} spreadSheetID ID of the spreadsheet to get data
 * @param {String} spreadSheetRange Range from the sheet (Blacklist!A5:Y5000 etc.)
 * @param {JSON} keys secret json file with service account keys.
 * @returns Promise object data from the google spreadsheet service.
 */
async function getSpreadSheetData(spreadSheetID, spreadSheetRange, keys) {
    return new Promise((resolve, reject) => {
        const spreadsheet = new google.auth.JWT(
            keys.client_email,
            null,
            keys.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );

        // Login to spreadsheet service
        spreadsheet.authorize(error => {
            if (error) return reject(error);
            gsrun(spreadsheet);
        });

        async function gsrun(cl) {
            const gsapi = google.sheets({ version: 'v4', auth: cl });

            // Get data object from the spreadsheet.
            const data = await gsapi.spreadsheets.values.get({
                spreadsheetId: spreadSheetID,
                range: spreadSheetRange
            }).catch(reject);


            if (!data) return reject(new Error('Couldn\'t get data from the spreadsheet.')); // Error if data object doesn't exist aka error above.
            else resolve(data);
        }
    });
}


/**
 * Remove rows that have under 3 character length club names, Push remaining data into an array, clear MongoDB collection and repopulate it with a new data.
 * @param {Object} data data received from getSpreadSheetData() fucntion.
 * @returns Either object with results (affectedDocs) or error object.
 */
function formatAndInsertCertificationData(data) {
    return new Promise((resolve, reject) => {
        if (!data || typeof data != 'object') return reject(new Error('Data object is either not provided or not a object.')); // Check if variable is provided and not empty.
        const TEA = data.data.values.filter(row => row[0]?.length >= 3); // Filter out rows without requirements: name (3 characters).
        const JSONobj = []; // Create JSON array for data to be inserted into Mongo.

        TEA.forEach(element => { // forEach[spreadsheed row] loop and push data to JSONobj array created earlier.

            // Transform undefined or empty cells into null object.
            const club = element[0]; // Has to have at least 3 symbols (ALWAYS)
            const description = element[1] === '' ? null : element[1];
            const world = element[2] === '' ? null : element[2];
            const requirements = element[3] === '' ? null : element[3];
            const representative = element[4] === '' ? null : element[4];
            const invite = element[5] === '' ? null : element[5];
            const id = element[6] === '' ? null : element[6];

            JSONobj.push({ club, description, world, requirements, representative, discord: { invite, id } }); // Push formatted value to the JSON object.
        });

        certificationModel.deleteMany({}) // Remove all documents from the certification collection.
            .then(deletedCount => {
                certificationModel.insertMany(JSONobj) // Insert to the certification collection all data from JSONobj.
                    .then(documents => resolve({ affectedDocs: { deleted: Object.values(deletedCount)[0], inserted: documents.length } }))
                    .catch(err => reject(err));
            })
            .catch(err => reject(err));
    });
}


/**
 * Remove rows that have under 3 character length names, Push remaining data into an array, clear MongoDB collection and repopulate it with a new data.
 * @param {*} data - data received from getSpreadSheetData() fucntion.
 * @returns Either object with results (affectedDocs) or error object.
 */
function formatAndInsertThreatData(data) {
    return new Promise(function (resolve, reject) {
        if (!data || typeof data != 'object') return reject(new Error('Data object is either not provided or not a object.')); // Check if variable is provided and not empty.
        const TEA = data.data.values.filter(row => row[1]?.length >= 3); // Filter out rows without requirements: name (3 characters).
        const JSONobj = []; // Create JSON array for data to be inserted into Mongo.

        TEA.forEach(element => { // forEach[spreadsheed row] loop and push data to JSONobj array created earlier.

            // Transform undefined or empty cells into null object.
            const name = element[1]; // Has to have at least 3 symbols (ALWAYS)
            const warning = element[2] === '' ? null : element[2];
            const reason = element[3] === '' ? null : element[3];
            const status = element[4] === '' ? null : element[4];
            const evidence = element[5] === '' ? null : element[5];
            const alternates = element[6] === '' ? null : element[6];
            const discord = element[7] === '' ? null : element[7];
            const notes = element[8] === '' ? null : element[8];
            const personal = element[9] === '' ? null : element[9];

            JSONobj.push({ name, warning, reason, status, evidence, alternates, discord, notes, personal }); // Push formatted value to the JSON object.
        });

        threatModel.deleteMany({}) // Remove all documents from the certification collection.
            .then(deletedCount => {
                threatModel.insertMany(JSONobj) // Insert to the certification collection all data from JSONobj.
                    .then(documents => resolve({ affectedDocs: { deleted: Object.values(deletedCount)[0], inserted: documents.length } }))
                    .catch(err => reject(err));
            })
            .catch(err => reject(err));
    });
}

module.exports = router;