var express = require('express');
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

app.listen(3000, () => {
	console.log('Light Controller listening on port 3000!')
	sc.loadRoomStatuses();
});

app.get('/statecenter', (req, res) => {
	var message = "";
	message += "\n\n### Living Room ###\n" + sc.getRoomState('living') + '\n' + JSON.stringify(sc.getTimer('living'));
	message += "\n\n### Bed Room ###\n" + sc.getRoomState('bed') + '\n' + JSON.stringify(sc.getTimer('bed'));
	message += "\n\n### Bath Room ###\n" + sc.getRoomState('bath') + '\n' + JSON.stringify(sc.getTimer('bath'));
	message += "\n\n### Kitchen ###\n" + sc.getRoomState('kitchen') + '\n' + JSON.stringify(sc.getTimer('kitchen'));

	rest.respond(res, message);
});

// Handles setting Color Temperature, Brightness, and Saturation attributes
app.get('/continuous', (req, res) => {
	sc.setRoomState(req.query.room, "custom");
	let percentage = parseInt(req.query.percentage);

	sc.stopTimer(req.query.room);

	Promise.all([mongo.getLights(req.query.room), hue.getOnStatusForRoom(req.query.room, {})]).then
	(result => {
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
	onOffHelper(
		res, 
		req.query.room, 
		"standardOn", 
		"turning lights on", 
		curryIt(hue.clock, "hour")
	);
});

app.get('/off', (req, res) => {
	onOffHelper(
		res, 
		req.query.room, 
		"off", 
		"turning lights off", 
		hue.off
	);
});

app.get('/toggle', (req, res) => {
	let rooms = rest.processRooms(req.query.room);
	let verb  = "toggling lights";
	roomQueue = [];
	rooms.forEach(room => {
		if (sc.getRoomState(room) !== "off") { // Turn lights off
			sc.prepareRoom(room, "off")
			roomQueue.push(hue.off(room));
		} else {
			sc.prepareRoom(room, "standardOn")
			roomQueue.push(hue.clock("hour", room));
		}
	});
	Promise.all(roomQueue)
	.then(
	 	success => rest.respond(res, rest.responseMessage(rooms, verb, true)),
	 	err => rest.respond(res, rest.responseMessage(rooms, verb, false), err)
	);
});

app.get('/clock', (req, res) => {
	sc.setRoomState('living', "clock");
	hue.clock("minute")
	.then(success => rest.respond(res, "clock started"), err => rest.respond(err));
});

app.get('/nightstand', (req, res) => {
	switch(sc.getRoomState('bedroom')) {
		case "night":
			sc.prepareRoom('bathroom', 'almostoff');
			sc.prepareRoom('bedroom', 'almostoff');
			hue.setScene("almostoff")
			.then(
				resposne => rest.respond(res, "almost off"),
				err => rest.respond(res, "Error occured setting to almost off", err)
			);
			break;
		case  "almostoff":
			sc.prepareRoom('kitchen', 'nightmode');
			sc.prepareRoom('bedroom', 'nightmode');
			sc.prepareRoom('living', 'nightmode');
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

// Catch-all for non-existent routes
app.use('*', function(req,res) {
	let message = '404 ' + req.baseUrl + " is not a valid route";
	logger(message);
	res.status(404).send(message);
});

var onOffHelper = function(res, rooms, roomState, verb, action) {
	rooms = rest.processRooms(rooms);
	roomQueue = [];
	rooms.forEach(room => {
		sc.prepareRoom(room, roomState)
		roomQueue.push(action(room));
	});
	Promise.all(roomQueue)
	.then(
	 	success => rest.respond(res, rest.responseMessage(rooms, verb, true)),
	 	err => rest.respond(res, rest.responseMessage(rooms, verb, false), err)
	);
}