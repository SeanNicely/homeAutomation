var mongo = require('mongodb').MongoClient;
var normalize = require('./utils.js').normalize;
var config = require('config');

var find = function(collection, query, fields) {
	return new Promise((resolve,reject) => {
		mongo.connect(config.dbUrl, (err, db) => {
			if (err) reject(new Error("MongoAPI Find was unable to connect to database", err));
			fields = fields || {};
			fields["_id"] = 0;
			try {
        db.collection(collection).findOne(query, fields)
  		  .then(data => data != null ? resolve(data) : reject(new Error("mongoApi.find says " + JSON.stringify(query) + ' not found in ' + collection)));
      } catch(err) {
        reject(new Error("MongoAPI Find Error Accessing Data", err));
      }
		});
	});
}

var update = function(collection, query, value) {
  return new Promise((resolve, reject) => {
    mongo.connect(config.dbUrl, (err, db) => {
      if (err) reject(new Error("MongoAPI Update was unable to connect to database", err));
      try {
        db.collection(collection).update(query, value)
        .then(success => {
          if(success.result.nModified && success.result.n) resolve("200 OK")
          else if (!success.result.nModified && success.result.n) resolve("Value already matches")
          else reject("mongoApi.update says Update failed")
        }, reject);
      } catch(err) {
        reject(new Error("MongoAPI Update Error Accessing Data", err));
      }
    });
  });
}

var saveRoomStatus = function(room, state) {
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
    .then(roomData => resolve(roomData.lights), er => reject(new Error("MongoApi.getLights: room " + room + " does not exist")));
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

var getLightType = function(light) {
  return new Promise((resolve, reject) => {
    find("lights", {"id": light})
    .then(data => resolve(data.type), err => reject(new Error("Light " + light + " not found")))
  });
}

module.exports = {
	find,
	normalize,
  saveRoomStatus,
	getLights,
	getColorXY,
  getRoomStatus,
  getScene,
  getHourData,
  getMinuteData,
  getLightType
}
