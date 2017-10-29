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

var setStateHelper = async function(light, body) { 
  await wait(Math.floor(Math.random()*500)+100);
  return new Promise((resolve,reject) => {
    body = JSON.parse(body);
    let options = new rest.Options("PUT", light+"/state/")
    rest.request(options, body)
    .then(response => resolve(response), err => reject("Light not reached: " + err))
  });
}

async function wait(ms) {
  await new Promise(resolve => setTimeout(() => resolve(), ms));
}

var setLightState = function(light, body) {
	return new Promise((resolve,reject) => {
      setStateHelper(light, JSON.stringify(body))
      .then(resolve, reject)
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
          let body = (lightTypes[i] === "Extended color light" && (Math.floor(Math.random()*100) % 4) === 0) ? new rest.Body(hourData.bri, null, true, null, hourData.xy) : new rest.Body(hourData.bri, ct, true);
          payload.push({"id": lights[i], "body": body});
        }
        utils.pluralize(hue.setLightState, payload).then(resolve, reject)
      }, reject);
    }, reject);
  });
}

var off = function(room) {
  return new Promise((resolve, reject) => {
    mongo.getLights(room)
    .then(lights => utils.pluralize(hue.setLightState, lights, {"on":false}))
    .then(resolve, reject)
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

var getTargetTime = function(currentTime, clockType) {
  var Hour = 1000*60*60;
  var targetTime = new Date();
  targetTime.setMilliseconds(0);
  targetTime.setSeconds(0);
  if (clockType === "hour") {
    targetTime.setMinutes(0);
    targetTime.setHours(currentTime.getHours() + 1);
  } else { // clockType is minutes
    targetTime.setMinutes(currentTime.getMinutes() + 1);
  }
  return targetTime;
}

var clock = function(clockType, room) {
  console.log("ClockType: ", clockType)
  const OneHour = 1000*60*60;
  const OneMinute = 1000 * 60;
  var interval = (clockType === "hour") ? OneHour : OneMinute;
  var currentTime = new Date();
  var targetTime = getTargetTime(currentTime, clockType);
  utils.logger(`Target time for ${room}: ${targetTime}`);
  room = room || "living";

  return new Promise((resolve, reject) => {
    hue.clockUpdate(clockType, room)
    .then(resolve, reject);
    sc.setTimer(room,  "timeout", setTimeout(() => {
      if (sc.getTimer(room)) {
        hue.clockUpdate(clockType, room);
        sc.setTimer(room, "interval", setInterval(function(){
          if (sc.getTimer(room)) {
            hue.clockUpdate(clockType, room)
            .catch(err => {
              utils.logger("Problem with ticking", err)
            });
          }
        }, interval));
      }
    }, targetTime - currentTime));
  });
}

var clockUpdate = function(clockType, room) {
	return new Promise((resolve, reject) => {
		if (clockType === "hour") on(room).then(resolve, reject)
		else minuteUpdate(new Date()).then(resolve, reject);
	});
}

var minuteUpdate = function(time) {
  var retVal = "";
  const livingRoom = {
    "top":11,
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
          .then(body =>  {
            hue.setLightState(livingRoom.top, body);
          }, rej)
          .then(res, rej)
        }); 
      }

      var tensProm = function() {
        return new Promise((res, rej) => {
          mongo.getMinuteData(Number(minutes[0]))
          .then(tensData => mongo.getColorXY(tensData.color, Body), rej)
          .then(body => {
            hue.setLightState(livingRoom.middle, body)
          }, rej)
          .then(res, rej);
        });
      }
      
      var onesProm = function() {
        return new Promise((res,rej) => {
          mongo.getMinuteData(Number(minutes[1]))
          .then(onesData => mongo.getColorXY(onesData.color, Body), rej)
          .then(body =>  {
            hue.setLightState(livingRoom.bottom, body)
          }, rej)
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
  off,
  clock,
  clockUpdate
};
