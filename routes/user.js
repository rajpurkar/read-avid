var mongoose = require('mongoose');


var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    salt: String,
    hash: String
});

module.exports = mongoose.model('users', UserSchema);