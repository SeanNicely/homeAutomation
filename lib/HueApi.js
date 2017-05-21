var mongoApi = require('./mongoApi.js');
var rest = require('./restApi.js');

var normalize = function(str) {
  return str.toLowerCase().replace(/the/g,"").replace(/\s+/g,"");
}

var pluralize = function(method, lights, body) {
  var lightQueue = [];

  lights.forEach(light => {
    lightQueue.push(method(light, body));
  });

  return new Promise((resolve, reject) => {
    Promise.all(lightQueue)
    .then(responses => resolve(responses), err => reject(err))
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
    case "bathroom":
    case "bath":
      lights = [7,8,9,10];
      break;
    case "all":
      lights = [1,2,4,5,6,7,8,9,10];
      break;
    default:
      lights = new Error(room + " is not a valid room")
  }
  return lights;
}

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

var getColorXY = function(color, body) {
  color = normalize(color);
	return new Promise((resolve,reject) => {
  		mongoApi.find("colors", {"name":color})
  		.then(colorInfo => {
        body.xy = colorInfo.xy;
        resolve(body)
      }, err => reject(err));
	});
}

var getCurrentState = function(light) {
  return new Promise((resolve, reject) => {
    let options = new rest.Options("GET", light);
    rest.request(options)
    .then(lightInfo => resolve(lightInfo.state), err => reject(err));
	});
}

var getTargetTime = function(currentTime) {
  var targetTime = new Date();
  targetTime.setMinutes(currentTime.getMinutes() + 1);
  targetTime.setSeconds(0);
  targetTime.setMilliseconds(0);

  return targetTime;
}

var setRoomStatus = function(room) {
  var body = {};
  return new Promise((resolve, reject) => {
    pluralize(getCurrentState, getLights(room), body)
    .then(states => {
      for (let state in states) {
        if (!state.on) body.on = true;
      }
      resolve(body);
    }, err => reject(err));
  });
}

var setOnStatus = function(light, body) {
  return new Promise((resolve, reject) => {
   	getCurrentState(light)
   	.then(currentState => {
   		if (!currentState.state.on) body.on = true;
   		resolve(body);
   	}, err => reject(err));
  });
}

var setLightState = function(light, body) {
	return new Promise((resolve,reject) => {
		let options = new rest.Options("PUT", light+"/state/")
    rest.request(options, body)
    .then(response => resolve(response), err => {
      if (err.code === "ECONNRESET") {
        setTimeout(() => setLightState(light, body), 300);
      } else reject(err);
    });
  });
}

var on = function(room) {
  let hour = new Date().getHours();
  return new Promise((resolve, reject) => {
    lights = getLights(room);
    mongoApi.find("clock", {"hour": hour})
    .then(hourData => {
      let body = new rest.Body(hourData.bri, null, true);
      body = getContinuous(body, "ct", 100 - (hourData.bri*100 / 255));
      pluralize(setLightState, lights, body);
    }, err => reject(err))
    .then(response => resolve(response), err => reject(err))
  });
}

var setScene = function(scene) {
  return new Promise((resolve, reject) => {
    mongo.find('scenes', {"name":scene})
    .then(sceneData => {
      console.log("sceneData", sceneData)
      sceneData.lights.forEach(light => {
        console.log("light", light)
        hueApi.setLightState(light.id, light.body)
        .then(response => resolve(response), err => reject(err));
      });
    }, err => reject(err));
  });
}

var clock = function(time) {
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
    mongoApi.find("clock", {"hour": hour})
    .then(hourData => {
      var Body = new rest.Body(hourData.bri, null, true);

      getColorXY(hourData.color, Body).then(body => setLightState(livingRoom.top, body), err => reject(err)).then(result => retVal += result, err => reject(err));

      mongoApi.find("clock", {"minute": Number(minutes[0])})
      .then(tensData => getColorXY(tensData.color, Body), err => reject(err))
      .then(body => setLightState(livingRoom.middle, body), err => reject(err))
      .then(result => retVal += result);
      
      mongoApi.find("clock", {"minute": Number(minutes[1])})
      .then(onesData => getColorXY(onesData.color, Body), err => reject(err))
      .then(body => setLightState(livingRoom.bottom, body), err => reject(err))
      .then(result => retVal += result, err => reject(err));
    })
    .then(resolve(retVal), err => reject(err));
  });
}

module.exports = {
	setLightState,
	getCurrentState,
  getContinuous,
	setOnStatus,
  setRoomStatus,
  setScene,
	getLights,
	getColorXY,
  getTargetTime,
  normalize,
  pluralize,
  on,
  clock
};