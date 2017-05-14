var mongo = require('mongodb').MongoClient;

var find = function(collection, query) {
	var promise = new Promise((resolve,reject) => {
		mongo.connect('mongodb://127.0.0.1:27017/Hue', (err, db) => {
			db.collection(collection).findOne(query)
  			.then(data => {
  				console.log(data);
  				data != null ? resolve(data) : reject(new Error(collection + ' not found'));
  			});
		});
	});
	return promise;
}

module.exports = {
	find
}
