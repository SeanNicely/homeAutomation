var normalize = require('./utils.js').normalize;
var logger = require('./utils.js').logger;
var mongo = require('./mongoApi.js');
var cron = require('node-cron');

var roomState = {
  "living": null,
  "bed": null,
  "bath": null,
  "kitchen": null
}

var setRoomState = function(room, state) {
	console.log(`Setting ${room} to ${state}`)
	room = normalize(room);
  	if (room === "all") {
    	for (let rm in roomState) {
      		roomState[rm] = state;
      		mongo.saveRoomStatus(rm, state);
    	}
  	} else if (typeof roomState[room] !== "undefined") {
  		roomState[room] = state;
  		mongo.saveRoomStatus(room, state)
  	} else return new ReferenceError("Room " + room + " does not exist")
}

var loadRoomStatuses = function() {
	mongo.getRoomStatus("bed").then(status => roomState.bed = status, err => logger("loadRoomStatuses Bed", err));
	mongo.getRoomStatus("bath").then(status => roomState.bath = status, err => logger("loadRoomStatuses Bath", err));
	mongo.getRoomStatus("living").then(status => roomState.living = status, err => logger("loadRoomStatuses Living", err));
	mongo.getRoomStatus("kitchen").then(status => roomState.living = status, err => logger("loadRoomStatuses Kitchen", err));
}

var getRoomState = function(room) {
	room = normalize(room);
	if (roomState[room]) return roomState[room]
	else return new Error("Room " + room + " does not exist")
}

var timers = {
	"living": {
		"type": null,
		"timer": null
	},
	"bed": {
		"type": null,
		"timer": null
	},
	"kitchen": {
		"type": null,
		"timer": null
	},
	"bath": {
		"type": null,
		"timer": null
	}
}

var getTimer = function(room) {
	room = normalize(room);
	if (typeof timers[room].timer !== 'undefined') return timers[room].type;
	else return new Error("Timer does not exist for room: " + room);
}

var setTimer = function(room, type, timerObj) {
	logger(`setting timer for ${room} of type ${type}`)
	room = normalize(room);
	if (room === "all") {
    	for (let rm in timers) {
      		timers[rm].timer = timerObj;
  			timers[rm].type = type;
    	}
  	} else if (typeof timers[room] !== "undefined") {
  		timers[room].timer = timerObj;
  		timers[room].type = type
  	} else throw new ReferenceError("Timer does not exist for room: " + room);
}

var setCronJob = function(room, expression, job) {
	logger(`setting cron job for ${room} with expression ${expression}`);
	room = normalize(room);
	if (room === "all") {
		for (let rm in timers) {
			timers[rm].timer = cron.schedule(expression, job);
			timers[rm].type = "cron";
		}
	} else if (typeof timers[room] != "undefined") {
		timers[room].timer = cron.schedule(expression, job);
		timers[room].type = "cron";
	}
}

var clearTimer = function(timer) {
	if(timer.timer) {
		timer.type = null;
		switch (timer.type) {
			case "interval":
				clearInterval(timer.timer);
				break;
			case "timeout": 
				clearTimeout(timer.timer);
				break;
			case "cron":
				timer.timer.stop();
				break;
		}
	}
	return timer;
}

var stopTimer = function(room) {
	room = normalize(room);
	if (room === "all") {
		logger("Clearing all timers")
		for (let rm in timers) {
			timers[rm] = clearTimer(timers[rm]);
		}
	} else if (timers[room]) {
		timers[room] = clearTimer(timers[room])
		logger("Cleared timer for " + room);
	}
	else return new Error("Timer does not exist for room: " + room)
	return "Timer cleared for " + room;
}

var prepareRoom = function(room, state) {
	sc.setRoomState(room, state);
	sc.stopTimer(room);
}


sc = module.exports = {
	getTimer,
	setTimer,
	stopTimer,
	getRoomState,
	setRoomState,
	loadRoomStatuses,
	setCronJob,
	prepareRoom
}