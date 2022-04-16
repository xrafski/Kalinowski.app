const { Schema, model } = require('mongoose');

const codeSchema = new Schema({
    identifier: { type: String, required: true, index: true, unique: true, dropDups: true }, // Combined Discord Server ID with code string.
    // code: { type: String, required: true, match: [/^[a-z0-9]*$/, 'Only alphanumeric lowercase characters are allowed.'] }, // Code that people need to use.
    code: { type: String, required: true }, // Code that people need to use.
    server: { type: String, required: true }, // Server ID.
    hint: { type: String, default: '' }, // Optional hint for people.
    prize: { type: String, required: true }, // Prize associated with the code.
    claimed: { type: Boolean, required: true, default: false }, // Whether the code is clamed.
    winner: { // Winner details.
        id: { type: String, default: '' }, // Discord User ID
        tag: { type: String, default: '' }, // Humand friendly discord user tag.
    }
}, {
    versionKey: false,
    autoCreate: true, // auto create collection
    autoIndex: true, // auto create indexes
    timestamps: true, // create timestamps
    collection: 'codes', // collection name
});


// Remove documents that not been modified in the last 60 days.
codeSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 * 60, name: 'Remove old codes' });

// Allow to search documents with text.
// codeSchema.index({ identifier: 'text' }, { name: 'Identification search by text' });

module.exports.mongoCodes = model('codes', codeSchema); // Export Mongo model.