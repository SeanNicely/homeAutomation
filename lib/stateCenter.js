var normalize = require('./utils.js').normalize;
var logger = require('./utils.js').logger;
var mongo = require('./mongoApi.js');
var cron = require('node-cron');

const roomList = [
	'living',
	'bed',
	'bath',
	'kitchen'
]

var roomState = {
  "living": null,
  "bed": null,
  "bath": null,
  "kitchen": null
}

var setRoomState = function(room, state) {
	console.log(`Setting ${room} to ${state}`)
	try {
		roomState[room] = state;
		mongo.saveRoomStatus(room, state)
  	} catch(error) {throw new ReferenceError("Room " + room + " does not exist") }
}

var prepareAllRooms = function(state) {
	for (let room of roomList) {
		prepareRoom(room, state);
	}
}

var getRoomState = function(room) {
	if (roomState[room]) return roomState[room]
	else return new Error("Room " + room + " does not exist")
}

var timers = {
	"living": {
		"type": null,
		"cronJob": null
	},
	"bed": {
		"type": null,
		"cronJob": null
	},
	"kitchen": {
		"type": null,
		"cronJob": null
	},
	"bath": {
		"type": null,
		"cronJob": null
	},
	"all": {
		"type": null,
		"cronJob": null
	}
}

var setCronJob = function(room, expression, job, immediateStart, functionStorageSubstitutions) {
	immediateStart = (typeof immediateStart === 'undefined') ? true : immediateStart;
	logger(`setting cron job for ${room} with expression ${expression}`);
	timers[room].cronJob = cron.schedule(expression, job, immediateStart);
	timers[room].type = "cron";
	mongo.saveCronStatus(room, expression, job, immediateStart, functionStorageSubstitutions);
}

var startCronJob = function(room) {
	timers[room].cronJob.start();
}

var stopCronJob = function(room) {
	if (timers[room].type != null) {
		timers[room].cronJob.destroy();
		timers[room].type = null;
	}
	logger("Cleared timer for " + room);
	mongo.saveCronStatus(room, null, null, null, null);
	return "Timer cleared for " + room;
}

var prepareRoom = function(room, state) {
	sc.setRoomState(room, state);
	sc.stopCronJob(room);
}

var initializeRoomStatuses = async function(){
	for (let room of roomList) {
		roomState[room] = await mongo.getRoomStatus(room);
		let cron = await mongo.getRoomCron(room);
		if (cron.expression != null) setCronJob(room, cron.expression, new Function(`return ${cron.job}`)(), cron.immediateStart);
	}
}


sc = module.exports = {
	getRoomState,
	setRoomState,
	prepareAllRooms,
	setCronJob,
	startCronJob,
	stopCronJob,
	prepareRoom,
	initializeRoomStatuses
}