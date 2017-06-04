var express = require('express');
var hue = require('./lib/HueApi.js');
var sc = require('./lib/stateCenter.js');
var rest = require('./lib/restApi.js');
var mongo = require('./lib/mongoApi.js');
var schedules = require('./lib/schedules.js');
var normalize = require('./lib/utils.js').normalize
	, logger = require('./lib/utils.js').logger
	, pluralize = require('./lib/utils.js').pluralize;
var app = express();

app.listen(3000, () => {
	console.log('Light Controller listening on port 3000!')
});

// Handles setting Color Temperature, Brightness, and Saturation attributes
app.get('/continuous', (req, res) => {
	sc.setRoomState(req.query.room, "custom");
	let percentage = parseInt(req.query.percentage);

	sc.stopTimer(req.query.room);

	Promise.all([mongo.getLights(req.query.room), hue.getOnStatusForRoom(req.query.room, {})]).then(result => {
		lights = result[0];
		body = result[1];
		body = hue.getContinuous(req.query.attribute, req.query.percentage, body);
		pluralize(hue.setLightState, lights, body)
	})
	.then(
		response => rest.respond(res, req.query.room + " lights set to " + req.query.percentage + " " + req.query.attribute),
		err => rest.respond(res, "Problem setting " + req.query.room + " lights to " + req.query.percentage + " " + req.query.attribute, err)
	);
});

app.get('/color', (req, res) => {
	sc.setRoomState(req.query.room, "custom");
	let problemString = "Problem setting " + req.query.room + " lights to " + req.query.color;

	sc.stopTimer(req.query.room);

	Promise.all([mongo.getLights(req.query.room), hue.getOnStatusForRoom(req.query.room), mongo.getColorXY(req.query.color)]).then(result => {
		lights = result[0];
		body = {};
		if (result[1]) body.on = result[1].on;
		body.xy = result[2];
		pluralize(hue.setLightState, lights, body)
	})
	.then(response => rest.respond(res, req.query.room + " lights set to " + req.query.color), err => rest.respond(res, problemString, err));
});

app.get('/scene', (req, res) => {
	sc.setRoomState(req.query.room, req.query.scene);
	hue.setScene(req.query.scene)
	.then(response => rest.respond(res, "Scene set to " + req.query.scene), err => rest.respond(res, "Problem setting scene to " + req.query.scene));
});

app.get('/on', (req, res) => {
	sc.setRoomState(req.query.room, "standardOn");
  	switch(normalize(req.query.room)) {
    	case "living":
      		res.redirect('/clock');
      		break;
    	case "all":
    		Promise.all([hue.on("bed"), hue.on("bath"), hue.clock()])
    		.then(response => rest.respond(res, req.query.room + " lights are now on"), err => rest.respond(res, "Problem turning on " + req.query.room + " lights"));
      		//hue.on("bed");
      		//hue.on("bath");
      		//res.redirect('/clock');
      		break;
    	default:
      		hue.on(normalize(req.query.room))
      		.then(response => rest.respond(res, req.query.room + " lights are now on"), err => rest.respond(res, "Problem turning on " + req.query.room + " lights"));
    }
});

app.get('/off', (req, res) => {
	req.query.room = req.query.room || "all";
	sc.setRoomState(req.query.room, "off");
	sc.stopTimer(req.query.room);
	mongo.getLights(req.query.room)
	.then(lights => pluralize(hue.setLightState, lights, {"on":false}))
	.then(
		response => rest.respond(res, req.query.room + " lights are now off"),
		err => rest.respond(res, "Problem turning off " + req.query.room + " lights", err)
	);
});

app.get('/clock', (req, res) => {
	hue.clock()
	.then(success => rest.respond(res, "clock started"), err => rest.respond(err));
});

app.get('/nightstand', (req, res) => {
	sc.stopTimer('bedroom');
	switch(sc.getRoomState('bedroom')) {
		case "bedroomnight":
			sc.setRoomState('bedroom', "almostoff");
			hue.setLightState(6, {"bri": 1})
			.then(
				resposne => rest.respond(res, "almost off"),
				err => rest.respond(res, "Error occured setting to almost off", err)
			);
			break;
		case  "almostoff":
			res.redirect('off');
			break;
		default:
			sc.setRoomState('bedroom', "bedroomnight");
			hue.setScene("bedroomnight")
			.then(
				resposne => rest.respond(res, "set scene to bedroomnight"),
				err => rest.respond(res, "Error occured setting to bedroom night", err)
			);
	}
});

// Catch-all for non-existent routes
app.use('*', function(req,res) {
	let message = '404 ' + req.baseUrl + " is not a valid route";
	logger(message);
	res.status(404).send(message);
});