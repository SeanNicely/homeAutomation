var express = require('express');
var chalk = require('chalk');
var hue = require('./lib/HueApi.js');
var sc = require('./lib/stateCenter.js');
var rest = require('./lib/restApi.js');
var mongo = require('./lib/mongoApi.js');
var schedules = require('./lib/schedules.js');
var normalize = require('./lib/utils.js').normalize
	, logger = require('./lib/utils.js').logger
	, pluralize = require('./lib/utils.js').pluralize
	, curryIt = require('./lib/utils.js').curryIt;
var app = express();
app.use(express.json());

app.listen(3000, () => {
	console.log('Light Controller listening on port 3000!')
	sc.initializeRoomStatuses();
});

app.get('/statecenter', (req, res) => {
	var message = "";
	message += "\n\n### Living Room ###\n" + sc.getRoomState('living');
	message += "\n\n### Bed Room ###\n" + sc.getRoomState('bed');
	message += "\n\n### Bath Room ###\n" + sc.getRoomState('bath');
	message += "\n\n### Kitchen ###\n" + sc.getRoomState('kitchen');

	rest.respond(res, message);
});

// Handles setting Color Temperature, Brightness, and Saturation attributes
app.get('/continuous', (req, res) => {
	let room = normalize(req.query.room);
	sc.prepareRoom(room, "custom");
	let percentage = parseInt(req.query.percentage);

	Promise.all([mongo.getLights(room), hue.getOnStatusForRoom(room, {})]).then
	(result => {
		let lights = result[0];
		let body = result[1];
		body = hue.getContinuous(req.query.attribute, req.query.percentage, body);
		pluralize(hue.setLightState, lights, body)
	})
	.then(
		response => rest.respond(res, room + " lights set to " + req.query.percentage + " " + req.query.attribute),
		err => rest.respond(res, "Problem setting " + room + " lights to " + req.query.percentage + " " + req.query.attribute, err)
	);
});

app.get('/color', (req, res) => {
	let room = normalize(req.query.room);
	sc.prepareRoom(room, "custom");
	let problemString = "Problem setting " + room + " lights to " + req.query.color;

	Promise.all([mongo.getLights(room), hue.getOnStatusForRoom(room), mongo.getColorXY(req.query.color)]).then(result => {
		let lights = result[0];
		let body = {};
		if (result[1]) body.on = result[1].on;
		body.xy = result[2];
		pluralize(hue.setLightState, lights, body)
	})
	.then(response => rest.respond(res, room + " lights set to " + req.query.color), err => rest.respond(res, problemString, err));
});

app.get('/scene', (req, res) => {
	sc.prepareRoom(normalize(req.query.room), req.query.scene);
	hue.setScene(req.query.scene)
	.then(response => rest.respond(res, "Scene set to " + req.query.scene), err => rest.respond(res, "Problem setting scene to " + req.query.scene));
});

app.get('/on', (req, res) => {
	onOffHelper(
		res, 
		normalize(req.query.room),
		"standardOn", 
		"turning lights on", 
		curryIt(hue.clock, "hour")
	);
});

app.get('/off', (req, res) => {
	onOffHelper(
		res, 
		normalize(req.query.room),
		"off", 
		"turning lights off", 
		hue.off
	);
});

app.get('/toggle', (req, res) => {
	let room = normalize(req.query.room);
	let verb  = "toggling lights";
	if (sc.getRoomState(room) !== "off") { // Turn lights off
		sc.prepareRoom(room, "off")
		hue.off(room)
		.then(
			success => rest.respond(res, `Success toggling lights off in the ${room} room`),
			err => rest.respond(res, `Problem toggling lights off in the ${room} room`, err)
		);
	} else {
		sc.prepareRoom(room, "standardOn")
		hue.clock("hour", room)
		.then(
			success => rest.respond(res, `Success toggling lights on in the ${room} room`),
			err => rest.respond(res, `Problem toggling lights on in the ${room} room`, err)
		);
	}
});

app.get('/clock', (req, res) => {
	sc.prepareRoom('living', "clock");
	hue.clock("minute")
	.then(success => rest.respond(res, "clock started"), err => rest.respond(err));
});

app.get('/nightstand', (req, res) => {
	switch(sc.getRoomState('bed')) {
		case "night":
			sc.prepareRoom('bath', 'almostoff');
			sc.prepareRoom('bed', 'almostoff');
			hue.setScene("almostoff")
			.then(
				resposne => rest.respond(res, "almost off"),
				err => rest.respond(res, "Error occured setting to almost off", err)
			);
			break;
		case  "almostoff":
			sc.prepareRoom('kitchen', 'nightmode');
			sc.prepareRoom('bed', 'off');
			sc.prepareRoom('living', 'nightmode');
			sc.prepareRoom('bath', 'nightmode');
			hue.setScene("nightmode")
			.then(
				resposne => rest.respond(res, "night mode"),
				err => rest.respond(res, "Error occured setting to night mode", err)
			);
			break;
		default:
			sc.prepareRoom('bedroom', "night");
			sc.prepareRoom('bathroom', 'night');
			hue.setScene("night")
			.then(
				resposne => rest.respond(res, "set scene to night"),
				err => rest.respond(res, "Error occured setting to night", err)
			);
	}
});

app.get('/currentState', (req, res) => {
	let lv = sc.getRoomState("living");
	let bd = sc.getRoomState('bed');
	let ba = sc.getRoomState('bath');
	rest.respond(res, lv + " " + bd + " " + ba);
});

app.post('/testRoute', (req, res) => {
	console.log(req.body.rooms);
});

// Catch-all for non-existent routes
app.use('*', function(req,res) {
	let message = '404 ' + req.baseUrl + " is not a valid route";
	logger(message);
	res.status(404).send(message);
});

var onOffHelper = async function(res, room, roomState, loggingVerb, action) {
	sc.prepareRoom(room, roomState);
	let result = await action(room);
	if (result)  rest.respond(res, rest.responseMessage(room, loggingVerb, true))
	else rest.respond(res, rest.responseMessage(room, loggingVerb, false), err);
}