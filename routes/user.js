var mongoose = require('mongoose');


var UserSchema = new mongoose.Schema({
    username: { type: String, unique: true},
    password: String,
    salt: String,
    hash: String
});

module.exports = mongoose.model('users', UserSchema);