var mongo = require('mongodb').MongoClient;

var find = function(collection, query, fields) {
	var promise = new Promise((resolve,reject) => {
		mongo.connect('mongodb://127.0.0.1:27017/Hue', (err, db) => {
			if (err) throw new Errow("Unable to connect to database");
			fields = fields || {};
			fields["_id"] = 0;
			db.collection(collection).findOne(query, fields)
  			.then(data => data != null ? resolve(data) : reject(new Error("Sean says " + JSON.stringify(query) + ' not found in ' + collection)));
		});
	});
	return promise;
}

module.exports = {
	find
}
