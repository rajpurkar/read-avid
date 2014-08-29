var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var bookSchema = new Schema({
	title: String,
	description: String
});

module.exports  = mongoose.model('Book', bookSchema);