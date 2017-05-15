var http = require('http');
var mongoApi = require('./mongoApi.js');

var Options = function(method, pathExtension) {
	this.host = "192.168.1.190",
	this.path = "/api/uDe4zdFPK-kklfaxTh3RFG6Kwe4EDyiSxwjXB5eg/lights/" + pathExtension,
	this.method = method
}

var normalize = function(str) {
  return str.toLowerCase().replace(/\s/g,"");
}

var pluralize = function(method, lights, body) {
  var lightQueue = [];

  lights.forEach(light => {
    lightQueue.push(method(light, body));
  });

  return new Promise((resolve, reject) => {
    Promise.all(lightQueue)
    .then(responses => resolve(responses))
  });
}

var httpRequest = function (options, body) {
	return new Promise((resolve, reject) => {
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
}

var getLights = function(room) {
  var lights;
  
  switch (normalize(room)) {
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

var getColorXY = function(color) {
  color = normalize(color);
	return new Promise((resolve,reject) => {
  		mongoApi.find("colors", {"name":color})
  		.then(colorInfo => resolve(colorInfo.xy))
      .catch(err => reject(err));
	});
}

var getCurrentState = function(light) {
  return new Promise((resolve, reject) => {
    let options = new Options("GET", light);
    httpRequest(options)
    .then(state => resolve(state));
	});
}

var getTargetTime = function(currentTime) {
  var targetTime = new Date();
  targetTime.setMinutes(currentTime.getMinutes() + 1);
  targetTime.setSeconds(0);
  targetTime.setMilliseconds(0);

  return targetTime;
}

var clock = function(time) {
  const livingRoom = {
    "top": 2,
    "middle": 4,
    "bottom": 1
  };
  var brightness;
  var hour = time.getHours();
  var minutes = time.getMinutes().toString().split("");
  if (minutes.length === 1) minutes.unshift(0);

  var Body = function(color, brightness) {
    this.xy = color;
    this.bri = brightness;
  }

  return new Promise((resolve, reject) => {
    mongoApi.find("clock", {"hour": hour})
    .then(hourData => {
        return new Promise((resolve, reject) => {
          brightness = hourData.bri;
          resolve(getColorXY(hourData.color));
        });
    })
    .then(hourXY => setLightState(livingRoom.top, new Body(hourXY, brightness)))
    .then(() => mongoApi.find("clock", {"minute": Number(minutes[0])}))
    .then(tensData => getColorXY(tensData.color))
    .then(tensXY => setLightState(livingRoom.middle, new Body(tensXY, brightness)))
    .then(() => mongoApi.find("clock", {"minute": Number(minutes[1])}))
    .then(tensData => getColorXY(tensData.color))
    .then(tensXY => setLightState(livingRoom.bottom, new Body(tensXY, brightness)))
    .then(result => resolve(result));
  });
}

var setOnStatus = function(light, body) {
  return new Promise((resolve, reject) => {
   	getCurrentState(light)
   	.then(currentState => {
   		if (!currentState.state.on) body.on = true;
   		resolve(body);
   	});
  });
}

var setLightState = function(light, body) {
	return new Promise((resolve,reject) => {
		let options = new Options("PUT", light+"/state/")
    httpRequest(options, body)
    .then(response => resolve(response));
  });
}

module.exports = {
	setLightState,
	getCurrentState,
	setOnStatus,
	getLights,
	getColorXY,
  getTargetTime,
  normalize,
  pluralize,
  clock
};