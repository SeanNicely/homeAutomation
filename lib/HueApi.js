var mongo = require('./mongoApi.js');
var rest = require('./restApi.js');
var sc = require('./stateCenter.js');
var utils = require('./utils.js');

var getContinuous = function(attribute, percentage, body) {
  var retVal;
  percentage = parseInt(percentage);
  switch (attribute) {
    case "bri":
    case "brightness":
      percentage = Math.floor(255*percentage/100);
      if (body) body.bri = percentage
      else retVal = percentage
      break;
    case "temperature":
    case "color temperature":
    case "colortemperature":
    case "ct":
      percentage = Math.floor(347*percentage/100 + 153);
      if (body) body.ct = percentage;
      else retVal = percentage
      break;
    case "sat":
    case "saturation":
      percentage = Math.floor(255*percentage/100);
      if (body) body.sat = percentage;
      else retVal = percentage
      break;
    default:
      return new Error(attribute + " is an invalid attribute");
  }
  if (body) return body
  else return retVal
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

var getOnStatusForRoom = function(room, body) {
  var retVal;
  room = utils.normalize(room);
  return new Promise((resolve, reject) => {
    mongo.getLights(room).then(lights => {
      utils.pluralize(hue.getCurrentState, lights)
      .then(states => {
        states.forEach(state => {
          if (!state.on && body) {body.on = true; resolve(body);}
          else if (!state.on && !body) retVal = ({"on":true})
        });
        if (body) resolve(body)
        else if (retVal) resolve(retVal)
        else resolve(null);
      }, reject);
    }, reject);
  });
}

var getOnStatus = function(light, body) {

  return new Promise((resolve, reject) => {
   	hue.getCurrentState(light)
   	.then(currentState => {
      if (!currentState.state.on && !body) resolve({"on":true})
   		else if (!currentState.state.on && body) {body.on = true; resolve(body)}
   		else if (currentState.state.on && body) resolve(body);
      else resolve(null)
   	}, reject);
  });
}

var setLightState = function(light, body) {
	return new Promise((resolve,reject) => {
		let options = new rest.Options("PUT", light+"/state/")
    rest.request(options, body)
    .then(response => resolve(response), err => {
      if (err.message.includes("ECONNRESET")) {
        setTimeout(() => rest.request(options, body).then(resolve, reject), 750);
      } else reject(err);
    });
  });
}

var on = function(room) {
  let hour = new Date().getHours();
  return new Promise((resolve, reject) => {
    Promise.all([mongo.getLights(room), mongo.getHourData(hour)]).then(results => {
      let lights = results[0];
      let hourData = results[1];
      let ct = getContinuous("ct", 100 - (hourData.bri*100 / 255));

      utils.pluralize(mongo.getLightType, lights)
      .then(lightTypes => {
        var payload = [];
        for (let i =0; i < lights.length; i++) {
          let body = (lightTypes[i] === "Extended color light") ? new rest.Body(hourData.bri, null, true, null, hourData.xy) : new rest.Body(hourData.bri, ct, true);
          payload.push({"id": lights[i], "body": body});
        }
        utils.pluralize(hue.setLightState, payload).then(resolve, reject)
      }, reject);
    }, reject);
  });
}

var setScene = function(scene) {
  return new Promise((resolve, reject) => {
    mongo.getScene(scene)
    .then(sceneData => {
      utils.pluralize(hue.setLightState, sceneData)
      .then(resolve, reject);
    }, reject);
  });
}

var clock = function() {
  var currentTime = new Date();
  var targetTime = getTargetTime(currentTime);

  return new Promise((resolve, reject) => {
    hue.clockUpdate(currentTime)
    .then(resolve, reject);
    setTimeout(() => {
      hue.clockUpdate(new Date());
      sc.setTimer('livingroom', setInterval(function(){
        hue.clockUpdate(new Date())
        .catch(err => {
          utils.logger("Problem with ticking", err)
        });
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
    mongo.getHourData(hour)
    .then(hourData => {
      var Body = new rest.Body(hourData.bri, null, true);
      
      var hourProm = function() {
        return new Promise((res, rej) => {
          mongo.getColorXY(hourData.color, Body)
          .then(body => hue.setLightState(livingRoom.top, body), rej)
          .then(res, rej)
        }); 
      }

      var tensProm = function() {
        return new Promise((res, rej) => {
          mongo.getMinuteData(Number(minutes[0]))
          .then(tensData => mongo.getColorXY(tensData.color, Body), rej)
          .then(body => hue.setLightState(livingRoom.middle, body), rej)
          .then(res, rej);
        });
      }
      
      var onesProm = function() {
        return new Promise((res,rej) => {
          mongo.getMinuteData(Number(minutes[1]))
          .then(onesData => mongo.getColorXY(onesData.color, Body), rej)
          .then(body => hue.setLightState(livingRoom.bottom, body), rej)
          .then(res, rej);
        });
      }

      Promise.all([hourProm(), tensProm(), onesProm()]).then(resolve, reject);
    }, reject);
  });
}

hue = module.exports = {
	setLightState,
	getCurrentState,
  getContinuous,
	getOnStatus,
  getOnStatusForRoom,
  setScene,
  getTargetTime,
  on,
  clock,
  clockUpdate
};