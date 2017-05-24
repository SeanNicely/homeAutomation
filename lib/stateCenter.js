var roomState = {
  "livingroom": null,
  "bedroom": null,
  "bathroom": null,
}

var setRoomState = function(room, state) {
  if (room === "all") {
    for (let rm in roomState) {
      roomState[rm] = state
    }
  } else if (typeof roomState[room] !== "undefined") roomState[room] = state
  else throw new ReferenceError("Room " + room + " does not exist")
}

var getRoomState = function(room) {
	if (roomState[room]) return roomState[room]
	else return new Error("Room " + room + " does not exist")
}

var timers = {
	"livingroom": null,
	"bedroom": null,
	"bathroom": null
}

var getTimer = function(room) {
	if (timers[room]) return timers[room];
	else return new Error("Timer does not exist for room: " + room);
}

var setTimer = function(room, timer) {
	if (room === "all") {
    	for (let rm in timers) {
      		timers[rm] = timer;
    	}
  	} else if (typeof timers[room] !== "undefined") timers[room] = timer;
	else throw new ReferenceError("Timer does not exist for room: " + room);
}

var stopTimer = function(room) {
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
	setRoomState
}