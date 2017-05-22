var mongo = require('mongodb').MongoClient;

var normalize = function(str) {
  return str.toLowerCase().replace(/the/g,"").replace(/\s+/g,"");
}

var find = function(collection, query, fields) {
	var promise = new Promise((resolve,reject) => {
		mongo.connect('mongodb://127.0.0.1:27017/Hue', (err, db) => {
			if (err) throw new Errow("Unable to connect to database");
			fields = fields || {};
			fields["_id"] = 0;
			db.collection(collection).findOne(query, fields)
  			.then(data => data != null ? resolve(data) : reject(new Error("mongoApi.find says " + JSON.stringify(query) + ' not found in ' + collection)));
		});
	});
	return promise;
}

var getColorXY = function(color, body) {
	color = normalize(color);
	return new Promise((resolve,reject) => {
  		find("colors", {"name":color})
  		.then(colorInfo => {
        	body.xy = colorInfo.xy;
        	resolve(body)
      	}, err => reject(err));
	});
}

var getLights = function(room) {
  var lights;
  switch (normalize(room)) {
    case "livingroom":
    case "living":
      lights = [1,2,4];
      break;
    case "bedroom":
    case "bed":
      lights = [5,6];
      break;
    case "bathroom":
    case "bath":
      lights = [7,8,9,10];
      break;
    case "all":
      lights = [1,2,4,5,6,7,8,9,10];
      break;
    default:
      lights = new Error(room + " is not a valid room")
  }
  return lights;
}

module.exports = {
	find,
	normalize,
	getLights,
	getColorXY
}
