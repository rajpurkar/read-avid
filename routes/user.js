var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var bookSchema = new Schema({
	title: String,
	author: String,
});

var UserSchema = new mongoose.Schema({
    username: { type: String, unique: true},
    password: String,
    salt: String,
    hash: String,
	books: [bookSchema]
});

module.exports = mongoose.model('users', UserSchema);