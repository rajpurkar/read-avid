var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
//var Book = require('book');

var UserSchema = new mongoose.Schema({
    username: { type: String, unique: true},
    password: String,
    salt: String,
    hash: String,
	books: [{ type: Schema.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('users', UserSchema);