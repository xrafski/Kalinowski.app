const { Schema, model } = require('mongoose');

const threatSchema = new Schema({
    name: { type: String, required: true, index: true, unique: true, dropDups: true, },
    warning: { type: String, default: null },
    reason: { type: String, required: true },
    status: { type: String, default: null },
    evidence: { type: String, default: null },
    alternates: { type: String, default: null },
    discord: { type: String, default: null },
    notes: { type: String, default: null },
    personal: { type: String, default: null }
}, {
    versionKey: false,
    autoCreate: true, // auto create collection
    autoIndex: true, // auto create indexes
    collection: 'threats'
});

// define indexes to create
// threatSchema.index({ name: 1 }, { unique: true, name: 'name_unique' });

module.exports.mongoThreat = model('threats', threatSchema); // Export Mongo model.