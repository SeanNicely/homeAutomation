var express = require('express');
var hueApi = require('./HueApi.js');
var app = express();

app.listen(3000, () => {
	console.log('Example app listening on port 3000!')
});

// Temporarily using to test getting colors from Mongo
app.get('/color', (req, res) => {
	let lights = hueApi.getLights(req.query.room);
	hueApi.getColorXY(req.query.color)
	.then(color => hueApi.setLightsStates(lights, {xy:color}))
	.then(response => res.send(response));
});



app.post('/', (req, res) => {
  	hueApi.getTest((error, response) => {
  		console.log(response);
  		res.send("hello");
  	});
});

var clock = function() {
	setInterval(function(){
		hueApi.setLightState(lights, body);
		body.on = !body.on;
	}, 5000);
}

lights = [1];
body = {on: false};
//clock();