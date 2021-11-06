const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    username: { type: String, required: true, index: true, unique: true, dropDups: true, min: 3, max: 64 },
    password: { type: String, required: true, max: 1024 },
    activated: { type: Boolean, default: false },
}, {
    versionKey: false,
    autoCreate: true, // auto create collection
    autoIndex: true, // auto create indexes
    collection: 'users'
});

// define indexes to create
// userSchema.index({ username: 1 }, { unique: true, name: 'username_unique' });

module.exports.mongoUser = model('users', userSchema); // Export Mongo model.