var express = require('express');
var hueApi = require('./HueApi.js');
var app = express();
var timers = {};


app.listen(3000, () => {
	console.log('Example app listening on port 3000!')
});

// Temporarily using to test getting colors from Mongo
app.get('/color', (req, res) => {
	clearInterval(timers[req.query.room]);
	let lights = hueApi.getLights(req.query.room);
	hueApi.getColorXY(req.query.color)
	.then(color => hueApi.pluralize(hueApi.setLightState, lights, {xy:color}),
		err => {
			console.log(err);
			res.send("shit's fucked yo!!!")
		})
	.then(response => res.send(response));
});

app.get('/off', (req, res) => {
	var room;
	req.query.room ? room = req.query.room : room = "all";
	hueApi.pluralize(hueApi.setLightState, hueApi.getLights(room), {"on":false})
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