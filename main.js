var express = require('express');
var hueApi = require('./lib/HueApi.js');
var schedules = require('./lib/schedules.js');
var rest = require('./lib/restApi.js');
var app = express();

app.listen(3000, () => {
	console.log('Light Controller listening on port 3000!')
	timers = schedules.timers;
});

// Handles setting Color Temperature, Brightness, and Saturation attributes
app.get('/continuous', (req, res) => {
	let percentage = parseInt(req.query.percentage);
	let lights = hueApi.getLights(req.query.room);

	schedules.stopClock(req.query.room);

	hueApi.setRoomStatus(req.query.room)
	.then(body => {
		body = hueApi.getContinuous(body, req.query.attribute, req.query.percentage);
		hueApi.pluralize(hueApi.setLightState, lights, body)
	})
	.then(
		response => rest.respond(res, req.query.room + " lights set to " + req.query.percentage + " " + req.query.attribute),
		err => rest.respond(res, "Problem setting " + req.query.room + " lights to " + req.query.percentage + " " + req.query.attribute, err)
	);
});

app.get('/color', (req, res) => {
	let lights = hueApi.getLights(req.query.room);
	let problemString = "Problem setting " + req.query.room + " lights to " + req.query.color;

	schedules.stopClock(req.query.room);

	hueApi.setRoomStatus(req.query.room)
	.then(body => hueApi.getColorXY(req.query.color, body), err => rest.respond(res, problemString, err))
	.then(body => hueApi.pluralize(hueApi.setLightState, lights, body), err => rest.respond(res, problemString, err))
	.then(response => rest.respond(res, req.query.room + " lights set to " + req.query.color), err => rest.respond(res, problemString, err));
});

app.get('/scene', (req, res) => {
	hueApi.setScene(req.query.scene)
	.then(response => rest.respond(res, "Scene set to " + req.query.scene), err => rest.respond(res, "Problem setting scene to " + req.query.scene));
});

app.get('/on', (req, res) => {
  	switch(hueApi.normalize(req.query.room)) {
	    case "livingroom":
    	case "living":
      		res.redirect('/clock');
      		break;
    	case "all":
      		hueApi.on("bedroom");
      		hueApi.on("bathroom");
      		res.redirect('/clock');
      		break;
    	default:
      		hueApi.on(hueApi.normalize(req.query.room))
    }
});

app.get('/off', (req, res) => {
	req.query.room = req.query.room || "all";
	let lights = hueApi.getLights(req.query.room);
	schedules.stopClock(req.query.room);
	hueApi.pluralize(hueApi.setLightState, lights, {"on":false})
	.then(
		response => rest.respond(res, req.query.room + " lights are now off"),
		err => rest.respond(res, "Problem turning off " + req.query.room + " lights", err)
	);
});

app.get('/clock', (req, res) => {
	var currentTime = new Date();
	var targetTime = hueApi.getTargetTime(currentTime);

	hueApi.clock(currentTime);
	setTimeout(() => {
		schedules.timers["livingroom"] = setInterval(function(){
			hueApi.clock(new Date());
		}, 60000);
	}, targetTime - currentTime);

	rest.respond(res, "clock started");
});