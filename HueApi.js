var http = require('http')

var httpRequest = function (options, body) {
	var promise = new Promise(function(resolve, reject) {
		var req = http.request(options, function(res) {
			var responseString = "";
			res.on('data', function(data){
				responseString += data;
			})
			res.on('end', function(){
				//console.log("Response String: " + responseString);
				resolve(JSON.parse(responseString));
			})
		}).on('error', function(err) {
	     	console.error('Error with the request:', err.message);
	 	});
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

var getCurrentState = function(lights) {
    var options = new Options("GET");
    var basePath = options.path;
    var lightQueue = [];

    lights.forEach(function(light) {
    	options.path = basePath + light;
    	lightQueue.push(httpRequest(options));
    });
    
    var promise = new Promise(function(resolve, reject){
	    Promise.all(lightQueue)
	    .then(function(states){
	    	resolve(states);
	    });
	});
	return promise;
}

var Options = function(method) {
	this.host = "192.168.1.190",
	this.path = "/api/uDe4zdFPK-kklfaxTh3RFG6Kwe4EDyiSxwjXB5eg/lights/",
	this.method = method
}

var setLightsStates = function(lights, options, body) {
	var basePath = options.path;
	lights.forEach(function(light){
    	options.path = basePath + light + "/state/";
    	let response = httpRequest(options, body);
  	});
}

// var exports = module.exports = {
// 	"httpRequest": httpRequest,
// 	"setLightsStates": setLightsStates,
// 	"Options": Options
// };

var exports = module.exports = {
	httpRequest,
	setLightsStates,
	getCurrentState,
	Options
};