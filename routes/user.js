var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var bookSchema = new Schema({
	title: String,
	author: String,
	dateFinished: { type: Date, default: Date.now },
	reading: { type: Boolean, default: false }
});

var UserSchema = new mongoose.Schema({
    username: { type: String, unique: true},
    fullname: {type: String, default: "Anonybunny"},
    password: String,
    salt: String,
    hash: String,
	books: [bookSchema]
});

module.exports = mongoose.model('users', UserSchema);