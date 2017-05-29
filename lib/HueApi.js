var mongo = require('./mongoApi.js');
var rest = require('./restApi.js');
var sc = require('./stateCenter.js');
var utils = require('./utils.js');

var getContinuous = function(body, attribute, percentage) {
  percentage = parseInt(percentage);
  switch (attribute) {
    case "bri":
    case "brightness":
      percentage = Math.floor(255*percentage/100);
      body.bri = percentage;
      break;
    case "temperature":
    case "color temperature":
    case "colortemperature":
    case "ct":
      percentage = Math.floor(347*percentage/100 + 153);
      body.ct = percentage;
      break;
    case "sat":
    case "saturation":
      percentage = Math.floor(255*percentage/100);
      body.sat = percentage;
      break;
    default:
      return new Error(attribute + " is an invalid attribute");
  }
  return body;
}

var getCurrentState = function(light) {
  return new Promise((resolve, reject) => {
    let options = new rest.Options("GET", light);
    rest.request(options)
    .then(lightInfo => resolve(lightInfo.state), reject);
	});
}

var getTargetTime = function(currentTime) {
  var targetTime = new Date();
  targetTime.setMinutes(currentTime.getMinutes() + 1);
  targetTime.setSeconds(0);
  targetTime.setMilliseconds(0);

  return targetTime;
}

var setOnStatusForRoom = function(room) {
  var body = {};
  return new Promise((resolve, reject) => {
    utils.pluralize(hue.getCurrentState, mongo.getLights(room))
    .then(states => {
      states.forEach(state => {
        if (!state.on) body.on = true;
      });
      resolve(body);
    }, reject);
  });
}

var setOnStatus = function(light, body) {
  return new Promise((resolve, reject) => {
   	hue.getCurrentState(light)
   	.then(currentState => {
   		if (!currentState.state.on) body.on = true;
   		resolve(body);
   	}, reject);
  });
}

var setLightState = function(light, body) {
	return new Promise((resolve,reject) => {
		let options = new rest.Options("PUT", light+"/state/")
    rest.request(options, body)
    .then(response => resolve(response), err => {
      if (err.message === "write ECONNRESET") {
        setTimeout(() => rest.request(options, body).then(resolve, reject), 500);
      } else reject(err);
    });
  });
}

var on = function(room) {
  let hour = new Date().getHours();
  return new Promise((resolve, reject) => {
    lights = mongo.getLights(room);
    mongo.find("clock", {"hour": hour})
    .then(hourData => {
      let body = new rest.Body(hourData.bri, null, true);
      body = getContinuous(body, "ct", 100 - (hourData.bri*100 / 255));
      return Promise.resolve(utils.pluralize(hue.setLightState, lights, body));
    }, reject)
    .then(resolve, reject)
  });
}

var setScene = function(scene) {
  return new Promise((resolve, reject) => {
    mongo.find('scenes', {"name":scene})
    .then(sceneData => {
      sceneData.lights.forEach(light => {
        hue.setLightState(light.id, light.body)
        .then(
  result => {
    console.log("function", result);
    resolve(result);
  }, err => {
    console.log("function", err);
    reject(err);
  })
      });
    }, reject);
  });
}

var clock = function() {
  var currentTime = new Date();
  var targetTime = getTargetTime(currentTime);

  return new Promise((resolve, reject) => {
    clockUpdate(currentTime)
    .then(resolve, reject);
    setTimeout(() => {
      clockUpdate(new Date())
      sc.setTimer('livingroom', setInterval(function(){
        clockUpdate(new Date())
        .then(resolve, reject);
      }, 60000));
    }, targetTime - currentTime);
  });
}

var clockUpdate = function(time) {
  var retVal = "";
  const livingRoom = {
    "top":2,
    "middle": 4,
    "bottom": 1
  };
  var hour = time.getHours();
  var minutes = time.getMinutes().toString().split("");
  if (minutes.length === 1) minutes.unshift(0);

  return new Promise((resolve, reject) => {
    mongo.find("clock", {"hour": hour})
    .then(hourData => {
      var Body = new rest.Body(hourData.bri, null, true);
      mongo.getColorXY(hourData.color, Body)
      .then(body => setLightState(livingRoom.top, body), reject)
      .then(result => retVal += result, reject);

      mongo.find("clock", {"minute": Number(minutes[0])})
      .then(tensData => mongo.getColorXY(tensData.color, Body), reject)
      .then(body => setLightState(livingRoom.middle, body), reject)
      .then(result => retVal += result);
      
      mongo.find("clock", {"minute": Number(minutes[1])})
      .then(onesData => mongo.getColorXY(onesData.color, Body), reject)
      .then(body => setLightState(livingRoom.bottom, body), reject)
      .then(result => retVal += result, reject);
    })
    .then(resolve(retVal), reject);
  });
}

hue = module.exports = {
	setLightState,
	getCurrentState,
  getContinuous,
	setOnStatus,
  setOnStatusForRoom,
  setScene,
  getTargetTime,
  on,
  clock
};