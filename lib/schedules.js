var cron = require('node-cron');
var hue = require('./HueApi.js');
var rest = require('./restApi.js');
var mongo = require('./mongoApi.js');

var FadeSettings = function(brightness, colorTemperature, on, saturation, xy, coefficient) {
	if (brightness) this.brightness = brightness;
	if (colorTemperature) this.temperature = colorTemperature;
	if (on) this.on = on;
	if (saturation) this.saturation = saturation;
	if (xy) this.xy = xy;
	if (coefficient) this.coefficient = coefficient;
}

var timers = {
	"livingroom": null,
	"bedroom": null,
	"bathroom": null
}

var stopClock = function(room) {
		if (room === "all") {
			for (let rm in timers) {
				if (timers[rm]) clearInterval(timers[rm]);
			}
		} else {
			if (timers[room]) clearInterval(timers[room]);
		}
		return "Timer cleared for " + room;
	}

var morningFadeIn = function() {
	var lights = mongo.getLights('all');
	var fs = new FadeSettings(1, 100, true, null, null, 2);

	cron.schedule('* 45 7 * * 1-5', () => morningJob.start());
	var morningJob = cron.schedule('*/30 * * * * *', () => {
		let convertedTemperature = Math.floor(347*fs.temperature/100 + 153);
		hue.pluralize(hue.setLightState, lights, new rest.Body(fs.brightness, convertedTemperature, fs.on))
		.then(() => {
			fs.on = false; //Stops it from sending the turn on command; doesn't turn the lights off
			fs.brightness += fs.coefficient;
			fs.temperature -= fs.coefficient;
		}, err => console.log(err));
	}, false);

	cron.schedule('* 10 8 * * 1-5', () => {
		morningJob.stop();
		fs = new FadeSettings(0, 100, true, null, null, 2); //reset fade settings
	})
}

var bedroomNight = function() {
	cron.schedule('0 0 23 * * *', () => {
		stopClock("bedroom");
		hue.setScene('bedroomnight')
	});
}

var initializeSchedules = (function(){
	morningFadeIn();
	bedroomNight();
}());


module.exports = {
	timers,
	stopClock
}