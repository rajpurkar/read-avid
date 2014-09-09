var request = require("request");

request('https://www.googleapis.com/books/v1/volumes?q=steve+jobs%20by%20walter%20isaacson', function(err, response, body){
	var body = JSON.parse(body);
	console.log(body.items[0].volumeInfo.description);
	console.log(body.items[0].volumeInfo.imageLinks.thumbnail);
});


