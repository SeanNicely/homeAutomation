var cron = require('node-cron');
var hueApi = require('./HueApi.js');
var rest = require('./restApi.js')

var morningFadeIn = function() {
	var on = true;
	var coefficient = 2;
	var temperature = 100;
	var brightness = 0;
	var lights = hueApi.getLights('all');

	var morningJob = cron.schedule('*/30 45 7 * * 1-5', () => {
		hueApi.pluralize(hueApi.setLightState, lights, new rest.Body(brightness, temperature, on))
		.then(() => {
			on = false; //Stops it from sending the turn on command; doesn't turn the lights off
			brightness += coefficient;
			temperature -= coefficient;
		}, err => console.log(err));
	});

	cron.schedule('* 10 8 * * 1-5', () => {
		morningJob.stop();
	})
}

var initializeSchedules = (function(){
	morningFadeIn();
}());

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