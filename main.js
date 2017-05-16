var express = require('express');
var hueApi = require('./HueApi.js');
var app = express();
var timers = {
	"livingroom": null,
	"bedroom": null,
	"bathroom": null
};

function respond(response, message, err) {
	err ? console.log(err) : console.log(message);
	response.send(message);
}

function stopClock(room) {
	if (room === "all") {
		for (let rm in timers) {
			console.log("whatup");
			if (timers[rm]) clearInterval(timers[rm]);
		}
	} else {
		if (timers[room]) clearInterval(timers[room]);
	}
	return "Timer cleared for " + room;
}

app.listen(3000, () => {
	console.log('Light Automator listening on port 3000!')
});

// Handles setting Brightness and Saturation attributes
app.get('/continuous', (req, res) => {
	stopClock(req.query.room);
	let attribute = req.query.attribute;
	let lights = hueApi.getLights(req.query.room);
	hueApi.pluralize(hueApi.setLightState, lights, {attribute:req.query.percentage})
	.then(
		response => respond(res, req.query.room + " lights set to " + req.query.color),
		err => respond(res, "Problem setting " + req.query.room + " to " + req.query.percentage + " percent " + req.query.attribute, err)
	);
});

app.get('/color', (req, res) => {
	let lights = hueApi.getLights(req.query.room);

	stopClock(req.query.room);

	hueApi.setRoomStatus(req.query.room)
	.then(body => hueApi.getColorXY(req.query.color, body))
	.then(
		body => hueApi.pluralize(hueApi.setLightState, lights, body),
		err => respond(res, "Problem setting " + req.query.room + " lights to " + req.query.color, err)
	)
	.then(
		response => respond(res, req.query.room + " lights set to " + req.query.color),
		err => respond(res, "Problem setting " + req.query.room + " lights to " + req.query.color, err)
	);
});

app.get('/off', (req, res) => {
	stopClock(req.query.room);
	hueApi.pluralize(hueApi.setLightState, hueApi.getLights(req.query.room), {"on":false})
	.then(
		response => respond(res, req.query.room + " lights are now off"),
		err => respond(res, "Problem turning off " + req.query.room + " lights", err)
	);
});

app.get('/clock', (req, res) => {
	var currentTime = new Date();
	var targetTime = hueApi.getTargetTime(currentTime);

	hueApi.clock(currentTime);
	setTimeout(() => {
		timers["livingroom"] = setInterval(function(){
			hueApi.clock(new Date());
		}, 60000);
	}, targetTime - currentTime);

	res.send("clock started");
});