var mongo = require('mongodb').MongoClient;
var db;
(function () {
	mongo.connect('mongodb://127.0.0.1:27017/Hue', (err, database) => {
		if (err) return console.log(err);
		db = database;
	});
})();

var find = function(collection, query) {
	var promise = new Promise((resolve,reject) => {
		db.collection(collection).findOne(query)
  		.then(data => resolve(data));
	});
	return promise;
}

module.exports = {
	find
}
