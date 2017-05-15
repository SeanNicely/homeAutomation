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
		timers.forEach(rm => {
			if (timers[rm]) clearInterval(timers[rm]);
		});
	} else {
		if (timers[rm]) clearInterval(timers[rm]);
	}
	return "Timer cleared for " + room;
}

app.listen(3000, () => {
	console.log('Light Automator listening on port 3000!')
});

// Handles setting Brightness and Saturation attributes
app.get('/continuous', (req, res) => {
	stopClock(req.query.room);
	let lights = hueApi.getLights(req.query.room);
	hueApi.pluralize(hueApi.setLightState, lights, {req.query.attribute:req.query.percentage})
	.then(
		response => respond(res, req.query.room + " lights set to " + req.query.color),
		err => respond(res, "Problem setting " + req.query.room + " to " + req.query.percentage + " percent " + req.query.attribute, err)
	);
});

app.get('/color', (req, res) => {
	stopClock(req.query.room);
	let lights = hueApi.getLights(req.query.room);
	hueApi.getColorXY(req.query.color)
	.then(
		color => hueApi.pluralize(hueApi.setLightState, lights, {xy:color}),
		err => respond(res, "Problem setting " + req.query.room + " lights to " + req.query.color", err);
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

app.post('/', (req, res) => {
  	hueApi.getTest((error, response) => {
  		console.log(response);
  		res.send("hello");
  	});
});

app.get('/clock', (req, res) => {
	var currentTime = new Date();
	var targetTime = hueApi.getTargetTime(currentTime);

	hueApi.pluralize(hueApi.setLightState, hueApi.getLights("livingroom"), {"on":true})
	.then(hueApi.clock(currentTime))
	setTimeout(() => {
		timers["livingroom"] = setInterval(function(){
			hueApi.clock(new Date());
		}, 60000);
	}, targetTime - currentTime);

	res.send("clock started");
});
