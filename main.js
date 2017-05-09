var express = require('express')
var hueApi = require('./HueApi.js')
var app = express()
var mongo = require('mongodb').MongoClient;
var db;

mongo.connect('mongodb://127.0.0.1:27017/Hue', function(err, database){
	if (err) return console.log(err);

	db = database;

	app.listen(3000, function () {
  		console.log('Example app listening on port 3000!')
	});
});


// Temporarily using to test getting colors from Mongo
app.get('/', function (req, res) {
	console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
	console.log(req.query.color);
	console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
  	res.send('Hello World!');
  	db.collection("colors").find({"name":req.query.color}).toArray(function(err, colorInfo){
		console.log(colorInfo);
	});
});



app.post('/', function (req, res) {
  	hueApi.getTest(function(error, response){
  		console.log(response);
  		res.send("hello");
  	});
});

lights = [1,2,4];
options = new hueApi.Options("GET");
hueApi.getCurrentState(lights).then(function(states) {
	console.log("Final output: " + JSON.stringify(states[0]));
})
//body = {"on":true};
//hueApi.setLightsStates(lights, options, body)