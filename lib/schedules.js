var cron = require('node-cron');
var hueApi = require('./HueApi.js');
var rest = require('./restApi.js')

var FadeSettings = function(brightness, colorTemperature, on, saturation, xy, coefficient) {
	if (brightness) this.brightness = brightness;
	if (colorTemperature) this.temperature = colorTemperature;
	if (on) this.on = on;
	if (saturation) this.saturation = saturation;
	if (xy) this.xy = xy;
	if (coefficient) this.coefficient = coefficient;
}

var morningFadeIn = function() {
	var lights = hueApi.getLights('all');
	var fs = new FadeSettings(0, 100, true, null, null, 2);

	var morningJob = cron.schedule('*/30 45 7 * * 1-5', () => {
		hueApi.pluralize(hueApi.setLightState, lights, new rest.Body(fs.brightness, fs.temperature, fs.on))
		.then(() => {
			fs.on = false; //Stops it from sending the turn on command; doesn't turn the lights off
			fs.brightness += fs.coefficient;
			fs.temperature -= fs.coefficient;
		}, err => console.log(err));
	});

	cron.schedule('* 10 8 * * 1-5', () => {
		morningJob.stop();
		fs = new FadeSettings(0, 100, true, null, null, 2); //reset fade settings
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