var express = require('express');
var hueApi = require('./HueApi.js');
var app = express();
var timers = {
	"livingroom": null,
	"bedroom": null,
	"bathroom": null
};

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

app.get('/color', (req, res) => {
	stopClock(req.query.room);
	let lights = hueApi.getLights(req.query.room);
	hueApi.getColorXY(req.query.color)
	.then(color => hueApi.pluralize(hueApi.setLightState, lights, {xy:color}),
		err => {
			console.log(err);
			res.send("Problem setting " + req.query.room + " to " + req.query.color + "\n" + err);
		})
	.then(response => res.send(req.query.room + " lights set to " + req.query.color));
});

app.get('/off', (req, res) => {
	stopClock(req.query.room);
	hueApi.pluralize(hueApi.setLightState, hueApi.getLights(req.query.room), {"on":false})
	.then(response => res.send(response));
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
