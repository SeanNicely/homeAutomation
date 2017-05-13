var express = require('express');
var hueApi = require('./HueApi.js');
var app = express();
var timers = {};


app.listen(3000, () => {
	console.log('Example app listening on port 3000!')
});

// Temporarily using to test getting colors from Mongo
app.get('/color', (req, res) => {
	let lights = hueApi.getLights(req.query.room);
	hueApi.getColorXY(req.query.color)
	.then(color => hueApi.setLightsStates(lights, {xy:color}),
		err => {
			console.log(err);
			res.send("shit's fucked yo!!!")
		})
	.then(response => res.send(response));
});



app.post('/', (req, res) => {
  	hueApi.getTest((error, response) => {
  		console.log(response);
  		res.send("hello");
  	});
});

app.get('/on', (req, res) => {
	var room = hueApi.normalize(req.query.room);
	var currentTime = new Date();
	var targetTime = hueApi.getTargetTime(currentTime);
	var offset = targetTime - currentTime;

	setTimeout(() => {
		console.log("IIIIIIIIIttttttt'sss TIIIIIIMMMMMEEEEE!!!!!" + room);
		timers[room] = setInterval(function(){
			console.log(room);
			//hueApi.setLightState(lights, body);
			//body.on = !body.on;
		}, 2000);
	},offset)

	res.send("clock started");
})

app.get('/clearTimer', (req, res) => {
	var room = hueApi.normalize(req.query.room);
	clearInterval(timers[room]);
});



lights = [1]
body = {on: false}