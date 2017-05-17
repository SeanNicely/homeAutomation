module.exports = {
	var timers = {
		"livingroom": null,
		"bedroom": null,
		"bathroom": null
	};

	var stopClock = function(room) {
		if (room === "all") {
			for (let rm in timers) {
				console.log("whatup");
				if (timers[rm]) clearInterval(timers[rm]);
			}
		} else {
			if (timers[room]) clearInterval(timers[room]);
		}
		return "Timer cleared for " + room;
	}
}