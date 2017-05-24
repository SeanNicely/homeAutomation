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
  } else roomState[room] = state;
}

var getRoomState = function(room) {
	return roomState[room];
}

var timers = {
	"livingroom": null,
	"bedroom": null,
	"bathroom": null
}

var getTimer = function(room) {
	return timers[room];
}

var setTimer = function(room, timer) {
	if (room === "all") {
    	for (let rm in timers) {
      		timers[rm] = timer;
    	}
  	} else timers[room] = timer;
	timers[room] = timer;
}

var stopTimer = function(room) {
	if (room === "all") {
		for (let rm in timers) {
			if (timers[rm]) clearInterval(timers[rm]);
		}
	} else if (timers[room]) clearInterval(timers[room]);
	return "Timer cleared for " + room;
}

module.exports = {
	getTimer,
	setTimer,
	stopTimer,
	getRoomState,
	setRoomState
}