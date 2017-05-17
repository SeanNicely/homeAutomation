module.exports = {
	timers: {
		"livingroom": null,
		"bedroom": null,
		"bathroom": null
	},

	stopClock: function(room) {
		if (room === "all") {
			for (let rm in timers) {
				if (timers[rm]) clearInterval(timers[rm]);
			}
		} else {
			if (timers[room]) clearInterval(timers[room]);
		}
		return "Timer cleared for " + room;
	}
}