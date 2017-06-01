var mongo = require('mongodb').MongoClient;
var normalize = require('./utils.js').normalize;

var find = function(collection, query, fields) {
	return new Promise((resolve,reject) => {
		mongo.connect('mongodb://127.0.0.1:27017/Hue', (err, db) => {
			if (err) throw new Errow("Unable to connect to database");
			fields = fields || {};
			fields["_id"] = 0;
			db.collection(collection).findOne(query, fields)
  		.then(data => data != null ? resolve(data) : reject(new Error("mongoApi.find says " + JSON.stringify(query) + ' not found in ' + collection)));
		});
	});
}

var update = function(collection, query, value) {
  return new Promise((resolve, reject) => {
    mongo.connect('mongodb://127.0.0.1:27017/Hue', (err, db) => {
      if (err) throw new Errow("Unable to connect to database");
      fields = fields || {};
      fields["_id"] = 0;
      db.collection(collection).update(query, value)
      .then(err => reject(err), success => resolve(success));
  });
}

var setRoomStatus = function(room, state) {
  return new Promise((resolve, reject) => {
    update("state", {"room":room}, {$set: {"status":state}})
    .then(resolve, reject);
  });
}

var getRoomStatus = function(room) {
  return new Promise((resolve, reject) => {
    find("state", {"room":room}, {"status":1})
    .then(resolve, reject);
  });
}

var getColorXY = function(color, body) {
	color = normalize(color);
	return new Promise((resolve,reject) => {
  		find("colors", {"name":color})
  		.then(colorInfo => {
        body.xy = colorInfo.xy;
        resolve(body)
      }, reject);
	});
}

var getLightsNew = function(room) {
  room = normalize(room);
  return new Promise((resolve, reject) => {
    find("rooms", {"room": room})
    .then(resolve, reject);
  });
}

var getScene = function(scene) {
  return new Promise((resolve, reject) => {
    find("scenes", {"scene": scene})
    .then(resolve, reject);
  });
}

var getHourData = function(hour) {
  return new Promise((resolve, reject) => {
    find("clock", {"hour": hour})
    .then(resolve, reject);
  });
}

var getMinuteData = function(minute) {
  return new Promise((resolve, reject) => {
    find("clock", {"minute": minute})
    .then(resolve, reject);
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
      lights = [7,8,9,10,11];
      break;
    case "all":
      lights = [1,2,4,5,6,7,8,9,10,11];
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
