var mongo = require('./mongoApi.js');
var rest = require('./restApi.js');
var sc = require('./stateCenter.js');
var utils = require('./utils.js');
var chalk = require('chalk');
var bottleneck = require('bottleneck');
var cron = require('node-cron');

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
  return new Promise(async (resolve, reject) => {
    let lights = await mongo.getLights(room);
    let states = await utils.pluralize(hue.getCurrentState, lights);
    states.forEach(state => {
      if (!state.on && body) {body.on = true; resolve(body);}
      else if (!state.on && !body) retVal = ({"on":true})
    });
    if (body) resolve(body)
    else if (retVal) resolve(retVal)
    else resolve(null);
  }, reject);
}

var getOnStatus = function(light, body) {
  return new Promise(async (resolve, reject) => {
   	let currentState = await hue.getCurrentState(light);
    if (!currentState.state.on && !body) resolve({"on":true})
 		else if (!currentState.state.on && body) {body.on = true; resolve(body)}
 		else if (currentState.state.on && body) resolve(body);
    else resolve(null);
  });
}

var setStateHelper = function(light, body) {
  return new Promise(async (resolve,reject) => {
    body = JSON.parse(body);
    body = await streamlineBody(light, body);
    let options = new rest.Options("PUT", light + "/state/")
    if (Object.keys(body) != 0) {
      limiter.schedule(() => rest.request(options, body))
          .then(response => resolve(response), err => reject("Light not reached: " + err))
    } else {
      utils.logger("Light already matches current state: " + options.path);
      resolve("Light already matches current state: " + options.path);
    }
  });
}

var streamlineBody = function(light, body) {
  return new Promise(async (resolve, reject) => {
    let currentState = await mongo.getLightState(light);
    if (typeof body.on !== "undefined" && body.on === currentState.on) delete body.on;
    for (let property in currentState.properties) {
      if (body[property] === currentState.properties[property]) delete body[property];
    }
    resolve(body);
  });
}

var setLightState = async function(light, body) {
	return new Promise((resolve,reject) => {
	  mongo.saveLightState(light, body);
      setStateHelper(light, JSON.stringify(body))
      .then(success => resolve("success"), error => {
        utils.logger(chalk.red(`Retrying light ${light}`, error));
        setStateHelper(light, JSON.stringify(body))
        .then(success => {utils.logger(chalk.green(`Retry for ${light} successful!`)); resolve()}, error => {
          utils.logger(chalk.red(`Failed to set state for light ${light}`, body, error))
          reject(error);
        });
      });
    });
}

var on = async function(room) {
  let hour = new Date().getHours();
  let lights = await mongo.getLights(room);
  let hourData = await mongo.getHourData(hour);
  let ct = getContinuous("ct", 100 - (hourData.bri*100 / 255));
  let failures = [];

  for (let i=0; i<lights.length; i++) {
    let lightType = await mongo.getLightType(lights[i]);
    let body = (lightType === "Extended color light" && (Math.floor(Math.random()*100) % 4) === 0) ? new rest.Body(hourData.bri, null, true, null, hourData.xy) : new rest.Body(hourData.bri, ct, true);
    let failure = await setLightState(lights[i], body);
    if (failure !== "success") failures.push(failure);
  }

  return failures;  
}

var off = async function(room) {
  let failures = []; 
  let lights = await mongo.getLights(room);
  let body = {"on":false};

  for (let light of lights) {
    let failure = await hue.setLightState(light, body);
    if (failure) failures.push(failure);
  }
  return failures;
}

var setScene = function(scene) {
  return new Promise(async (resolve, reject) => {
    let sceneData = await mongo.getScene(scene)
    utils.pluralize(hue.setLightState, sceneData.lights).then(resolve, reject);
  });
}

var clock = function(clockType, room) {
  const cronHour = '0 0 * * * *';
  const cronMinute = '0 * * * * *';
  let cronExpression = (clockType === "hour") ? cronHour : cronMinute;

  return new Promise((resolve, reject) => {
    hue.clockUpdate(clockType, room)
    .then(resolve, reject);
    let functionStorageSubstitutions = [
        {"variable":"clockType", "replacement":"\'"+clockType+"\'"},
        {"variable":"room", "replacement":"\'"+room+"\'"}
    ];
    sc.setCronJob(room, cronExpression, () => {
      hue.clockUpdate(clockType, room)
      .catch(err => utils.logger("Problem with ticking", err));
    }, true, functionStorageSubstitutions);
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

  return new Promise(async (resolve, reject) => {
    let hourData = await mongo.getHourData(hour)
    var Body = new rest.Body(hourData.bri, null, true);
    
    var hourProm = function() {
      return new Promise(async (res, rej) => {
        let body = await mongo.getColorXY(hourData.color, Body);
        hue.setLightState(livingRoom.top, body).then(res, rej)
      }); 
    }

    var tensProm = function() {
      return new Promise(async (res, rej) => {
        let tensData = await mongo.getMinuteData(Number(minutes[0]));
        let body = await mongo.getColorXY(tensData.color, Body);
        hue.setLightState(livingRoom.middle, body).then(res, rej);
      });
    }
    
    var onesProm = function() {
      return new Promise(async (res,rej) => {
        let onesData = await mongo.getMinuteData(Number(minutes[1]))
        let body = await mongo.getColorXY(onesData.color, Body);
        hue.setLightState(livingRoom.bottom, body).then(res, rej);
      });
    }

    Promise.all([hourProm(), tensProm(), onesProm()]).then(resolve, reject);
  });
}

const limiter = new bottleneck({
  maxConcurrent: 3,
  minTime: 100
});

hue = module.exports = {
  setLightState,
  getCurrentState,
  getContinuous,
  getOnStatus,
  getOnStatusForRoom,
  setScene,
  on,
  off,
  clock,
  clockUpdate
};
