var cron = require('node-cron');
var hue = require('./HueApi.js');
var rest = require('./restApi.js');
var mongo = require('./mongoApi.js');
var sc = require('./stateCenter.js');
var logger = require('./utils.js').logger
	, pluralize = require('./utils.js').pluralize;

var FadeSettings = function(brightness, colorTemperature, on, saturation, xy, coefficient) {
	if (brightness) this.brightness = brightness;
	if (colorTemperature) this.temperature = colorTemperature;
	if (on) this.on = on;
	if (saturation) this.saturation = saturation;
	if (xy) this.xy = xy;
	if (coefficient) this.coefficient = coefficient;
}

var morningFadeIn = function() {
	var fs = new FadeSettings(1, 100, true, null, null, 2);
	console.log("New fs", fs)

	mongo.getLights('all').then(lights => {
		cron.schedule('0 45 7 * * 1-5', () => {
			logger("morning fade started")
			sc.setRoomState('all', 'morningfade')
			morningJob.start()
		});
		var morningJob = cron.schedule('*/30 * * * * *', () => {
			let convertedTemperature = Math.floor(347*fs.temperature/100 + 153);
			let convertedBrightness = Math.floor(255*fs.brightness/100);
			logger("fs", fs);
			logger("convertedBrightness", convertedBrightness);
			logger("convertedTemperature", convertedTemperature);
			pluralize(hue.setLightState, lights, new rest.Body(convertedBrightness, convertedTemperature, fs.on))
			.then(() => {
				fs.brightness += fs.coefficient;
				fs.temperature -= fs.coefficient;
			}, err => logger(err));
		}, false);

		sc.setTimer("all", morningJob);

		cron.schedule('0 10 8 * * 1-5', () => {
			morningJob.stop();
			setTimeout(() => {
				fs = new FadeSettings(1, 100, true, null, null, 2); //reset fade settings
			}, 5000);
		})
	}, err => logger("MorningFadeIn", err));
}

var bedroomNight = function() {
	cron.schedule('0 0 23 * * *', () => {
		sc.stopTimer("bedroom");
		sc.setRoomState('bedroom', 'night');
		hue.setScene('night')
		.then(success => logger("bedrooom night activated"), err => logger(err));
	});
}

var checkFadeSettings = function() {
	cron.schedule('0 57 17 * * *', () => {
		console.log("logging fade settings", fs);
	})
}

var initializeSchedules = (function(){
	morningFadeIn();
	bedroomNight();
}());