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
	var lights = mongo.getLights('all');
	var fs = new FadeSettings(1, 100, true, null, null, 2);

	cron.schedule('25 28 18 * * 1-5', () => {
		logger("morning fade started")
		sc.setRoomState('all', 'morningfade')
		morningJob.start()
	});
	var morningJob = cron.schedule('*/30 * * * * *', () => {
		let convertedTemperature = Math.floor(347*fs.temperature/100 + 153);
		let convertedBrightness = Math.floor(255*fs.brightness/100);
		pluralize(hue.setLightState, lights, new rest.Body(convertedBrightness, convertedTemperature, fs.on))
		.then(() => {
			fs.on = false; //Stops it from sending the turn on command; doesn't turn the lights off
			fs.brightness += fs.coefficient;
			fs.temperature -= fs.coefficient;
		}, err => logger(err));
	}, false);

	cron.schedule('0 10 8 * * 1-5', () => {
		logger("morning fade stopped")
		morningJob.stop();
		fs = new FadeSettings(0, 100, true, null, null, 2); //reset fade settings
	})
}

var bedroomNight = function() {
	cron.schedule('55 13 23 * * *', () => {
		sc.stopTimer("bedroom");
		sc.setRoomState('bedroom', 'bedroomnight');
		hue.setScene('bedroomnight')
		.then(success => logger("bedrooom night activated"), err => logger(err));
	});
}

var initializeSchedules = (function(){
	morningFadeIn();
	bedroomNight();
}());