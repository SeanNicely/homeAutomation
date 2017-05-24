var cron = require('node-cron');
var hue = require('./HueApi.js');
var rest = require('./restApi.js');
var mongo = require('./mongoApi.js');
var sc = require('./stateCenter.js');

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

	sc.setRoomState('morningfade')
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
	cron.schedule('40 21 23 * * *', () => {
		sc.stopTimer("bedroom");
		sc.setRoomState('bedroomnight');
		hue.setScene('bedroomnight')
		.then(success => console.log("bedrooom night activated"), err => err)
	});
}

var initializeSchedules = (function(){
	morningFadeIn();
	bedroomNight();
}());