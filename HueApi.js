var http = require('http')

var Options = function(method, pathExtension) {
	this.host = "192.168.1.190",
	this.path = "/api/uDe4zdFPK-kklfaxTh3RFG6Kwe4EDyiSxwjXB5eg/lights/" + pathExtension,
	this.method = method
}

var httpRequest = function (options, body) {
	var promise = new Promise((resolve, reject) => {
		var req = http.request(options, res => {
			var responseString = "";
			res.on('data', data => responseString += data);
			res.on('end', () => resolve(JSON.parse(responseString)));
		})
		.on('error', err => console.error('Error with the request:', err.message));

		body = JSON.stringify(body);
	 	if (typeof body !== "undefined") req.write(body);
	 	req.end();
	});
	return promise;
}

var getLights = function(room) {
  var lights;
  
  switch (room.toLowerCase().replace(/\s/g,"")) {
    case "livingroom":
    case "living":
      lights = [1,2,4];
      break;
    case "bedroom":
    case "bed":
      lights = [5,6];
      break;
    default:
      lights = [1,2,4,5,6];
  }
  return lights;
}

var getCurrentStates = function(lights) {
    var lightQueue = [];

    lights.forEach(function(light) {
    	lightQueue.push(getCurrentState(light));
    });
    
    let promise = new Promise(function(resolve, reject){
	    Promise.all(lightQueue)
	    .then(states => resolve(states));
	});
	return promise;
}

var getContinuous = function(body, action, percentage) {
  percentage = parseInt(percentage);
  switch (action) {
    case "brightness":
      percentage = Math.floor(255*percentage/100);
      body["bri"] = percentage;
      break;
    case "temperature":
      percentage = Math.floor(347*percentage/100 + 153);
      body["ct"] = percentage;
      break;
    case "saturation":
      percentage = Math.floor(255*percentage/100);
      body["sat"] = percentage;
      break;
  }
  return body;
}

var getCurrentState = function(light) {
    let promise = new Promise((resolve, reject) => {
    	let options = new Options("GET", light);
    	httpRequest(options)
    	.then(state => resolve(state));
	});
	return promise;
}

var setOnStatus = function(light, body) {
    let promise = new Promise((resolve, reject) => {
    	getCurrentStates(light)
    	.then(currentState => {
    		if (!currentState.state) body.on = true;
    		resolve(body);
    	});
    });
    return promise;
}

var setLightsStates = function(lights, options, body) {
	var basePath = options.path;
	lights.forEach(light => {

    	options.path = basePath + light + "/state/";
    	let response = httpRequest(options, body);
  	});
}

var exports = module.exports = {
	httpRequest,
	setLightsStates,
	getCurrentStates,
	getCurrentState,
	Options,
	setOnStatus
};