var express = require('express')
var hueApi = require('./HueApi.js')
var app = express()
var mongo = require('mongodb').MongoClient;
var db;

mongo.connect('mongodb://127.0.0.1:27017/Hue', (err, database) => {
	if (err) return console.log(err);

	db = database;

	app.listen(3000, () => {
  		console.log('Example app listening on port 3000!')
	});
});


// Temporarily using to test getting colors from Mongo
app.get('/', (req, res) => {
	console.log(req.query.color);
  	db.collection("colors").find({"name":req.query.color}).toArray((err, colorInfo) => {
		console.log(colorInfo);
	});
});



app.post('/', (req, res) => {
  	hueApi.getTest((error, response) => {
  		console.log(response);
  		res.send("hello");
  	});
});

lights = [1,2,4];
body = {};
hueApi.getCurrentStates(lights).then(states => {
	console.log("Final output: " + JSON.stringify(states));
})