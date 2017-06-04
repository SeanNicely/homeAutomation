var normalize = require('./utils.js').normalize;
var mongo = require('./mongoApi.js');

var roomState = {
  "living": null,
  "bed": null,
  "bath": null,
}

var setRoomState = function(room, state) {
	room = normalize(room);
  	if (room === "all") {
    	for (let rm in roomState) {
      		roomState[rm] = state;
      		mongo.saveRoomStatus(rm, state);
    	}
  	} else if (typeof roomState[room] !== "undefined") {
  		roomState[room] = state;
  		mongo.saveRoomStatus(room, state)
  	} else throw new ReferenceError("Room " + room + " does not exist")
}

var loadRoomStatuses = function() {
	mongo.getRoomStatus("bed").then(status => roomState.bed = status);
	mongo.getRoomStatus("bath").then(status => roomState.bath = status);
	mongo.getRoomStatus("living").then(status => roomState.living = status);
}

var getRoomState = function(room) {
	room = normalize(room);
	if (roomState[room]) return roomState[room]
	else return new Error("Room " + room + " does not exist")
}

var timers = {
	"living": null,
	"bed": null,
	"bath": null
}

var getTimer = function(room) {
	room = normalize(room);
	if (timers[room]) return timers[room];
	else return new Error("Timer does not exist for room: " + room);
}

var setTimer = function(room, timer) {
	room = normalize(room);
	if (room === "all") {
    	for (let rm in timers) {
      		timers[rm] = timer;
    	}
  	} else if (typeof timers[room] !== "undefined") timers[room] = timer;
	else throw new ReferenceError("Timer does not exist for room: " + room);
}

var stopTimer = function(room) {
	room = normalize(room);
	if (room === "all") {
		for (let rm in timers) {
			if (timers[rm]) clearInterval(timers[rm]);
		}
	} else if (timers[room]) clearInterval(timers[room])
	else return new Error("Timer does not exist for room: " + room)
	return "Timer cleared for " + room;
}

module.exports = {
	getTimer,
	setTimer,
	stopTimer,
	getRoomState,
	setRoomState,
	loadRoomStatuses
}