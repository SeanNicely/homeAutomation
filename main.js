var express = require('express');
var hue = require('./lib/HueApi.js');
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
	let lights = mongo.getLights(req.query.room);

	schedules.stopClock(req.query.room);

	hue.setRoomStatus(req.query.room)
	.then(body => {
		body = hue.getContinuous(body, req.query.attribute, req.query.percentage);
		hue.pluralize(hue.setLightState, lights, body)
	})
	.then(
		response => rest.respond(res, req.query.room + " lights set to " + req.query.percentage + " " + req.query.attribute),
		err => rest.respond(res, "Problem setting " + req.query.room + " lights to " + req.query.percentage + " " + req.query.attribute, err)
	);
});

app.get('/color', (req, res) => {
	let lights = mongo.getLights(req.query.room);
	let problemString = "Problem setting " + req.query.room + " lights to " + req.query.color;

	schedules.stopClock(req.query.room);

	hue.setRoomStatus(req.query.room)
	.then(body => mongo.getColorXY(req.query.color, body), err => rest.respond(res, problemString, err))
	.then(body => hue.pluralize(hue.setLightState, lights, body), err => rest.respond(res, problemString, err))
	.then(response => rest.respond(res, req.query.room + " lights set to " + req.query.color), err => rest.respond(res, problemString, err));
});

app.get('/scene', (req, res) => {
	hue.setScene(req.query.scene)
	.then(response => rest.respond(res, "Scene set to " + req.query.scene), err => rest.respond(res, "Problem setting scene to " + req.query.scene));
});

app.get('/on', (req, res) => {
  	switch(hue.normalize(req.query.room)) {
	    case "livingroom":
    	case "living":
      		res.redirect('/clock');
      		break;
    	case "all":
      		hue.on("bedroom");
      		hue.on("bathroom");
      		res.redirect('/clock');
      		break;
    	default:
      		hue.on(hue.normalize(req.query.room))
    }
});

app.get('/off', (req, res) => {
	req.query.room = req.query.room || "all";
	let lights = mongo.getLights(req.query.room);
	schedules.stopClock(req.query.room);
	hue.pluralize(hue.setLightState, lights, {"on":false})
	.then(
		response => rest.respond(res, req.query.room + " lights are now off"),
		err => rest.respond(res, "Problem turning off " + req.query.room + " lights", err)
	);
});

app.get('/clock', (req, res) => {
	hue.clock()
	.then(success => rest.respond(res, "clock started"), err => rest.respond(err));
});