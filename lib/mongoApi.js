var mongo = require('mongodb').MongoClient;
var normalize = require('./utils.js').normalize;
var config = require('config');

var find = function(collection, query, fields) {
	return new Promise((resolve,reject) => {
		mongo.connect(config.dbUrl, (err, db) => {
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
    mongo.connect(config.dbUrl, (err, db) => {
      if (err) throw new Errow("Unable to connect to database");
      db.collection(collection).update(query, value)
      .then(success => {
        if(success.result.nModified && success.result.n) resolve("200 OK")
        else if (!success.result.nModified && success.result.n) resolve("Value already matches")
        else reject("mongoApi.update says Update failed")
      }, reject);
    });
  });
}

var setRoomStatus = function(room, state) {
  room = normalize(room);
  return new Promise((resolve, reject) => {
    update("rooms", {"name":room}, {$set: {"state":state}})
    .then(resolve, reject);
  });
}

var getRoomStatus = function(room) {
  room = normalize(room);
  return new Promise((resolve, reject) => {
    find("rooms", {"name":room}, {"state":1})
    .then(data => resolve(data.state), reject);
  });
}

var getColorXY = function(color, body) {
	color = normalize(color);
	return new Promise((resolve,reject) => {
  		find("colors", {"name":color})
  		.then(colorInfo => {
        if (body) {
          body.xy = colorInfo.xy;
          resolve(body)
        } else resolve(colorInfo.xy)
      }, err => reject(new Error("color " + color + " does not exist")));
	});
}

var getLights = function(room) {
  room = normalize(room);
  return new Promise((resolve, reject) => {
    find("rooms", {"name": room})
    .then(roomData => resolve(roomData.lights), er => reject(new Error("room " + room + " does not exist")));
  });
}

var getScene = function(scene) {
  scene = normalize(scene);
  return new Promise((resolve, reject) => {
    find("scenes", {"name": scene})
    .then(sceneInfo => resolve(sceneInfo.lights), err => reject(new Error("Scene " + scene + " not found")));
  });
}

var getHourData = function(hour) {
  return new Promise((resolve, reject) => {
    find("clock", {"hour": hour})
    .then(resolve, err => reject("Hour " + hour + " is outside of range"));
  });
}

var getMinuteData = function(minute) {
  return new Promise((resolve, reject) => {
    find("clock", {"minute": minute})
    .then(resolve, er => reject(new Error("Minute " + minute + " is outside of range")));
  });
}

var getLightsDeprecated = function(room) {
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
	getColorXY,
  getRoomStatus,
  getLightsDeprecated,
  setRoomStatus,
  getScene,
  getHourData,
  getMinuteData
}
