var http = require('http');
var logger = require('./utils.js').logger;
var normalize = require('./utils.js').normalize;

var formatRoom = function(room) {
	const roomList = ["living","bath","bed"]
	if (roomList.indexOf(room) >= 0) room += "room";
	return room;
}

module.exports = {
	Options: function(method, pathExtension) {
		this.host = "192.168.1.190",
		this.path = "/api/uDe4zdFPK-kklfaxTh3RFG6Kwe4EDyiSxwjXB5eg/lights/" + pathExtension,
		this.method = method
	},

	Body: function(brightness, colorTemperature, on, saturation, xy) {
		if (brightness) this.bri = brightness;
		if (colorTemperature) this.ct = colorTemperature;
		if (on) this.on = on;
		if (saturation) this.sat = saturation;
		if (xy) this.xy = xy;
	},

	request: function (options, body) {
		return new Promise((resolve, reject) => {
			if (Object.keys(body) != 0) {
				logger("Body: " + JSON.stringify(body) + "\tOptions: " + JSON.stringify(options));
				var req = http.request(options, res => {
					var responseString = "";
					res.on('data', data => responseString += data);
					res.on('end', () => resolve(JSON.parse(responseString)));
				})
					.on('error', err => reject(err));

				body = JSON.stringify(body);
				if (typeof body !== "undefined") req.write(body);
				req.end();
			} else {
				logger("Light already matches current state: " + options.path);
				resolve("Light already matches current state: " + options.path);
			}
		});
	},

	respond: function(response, message, err) {
		logger(message, err);
		response.send(message);
	},

	processRooms: function(query) {
		let normalizedRooms = [];
		for (let i = 0; i < query.length; i++) {
			normalizedRooms[i] = normalize(query[i]);
		}

		return normalizedRooms;
	},

	responseMessage: function(room, verb, success) {
		const successString = `Success with ${verb} in the ${room}`;
		const failureString = `Problem with ${verb} in the ${room}`;
		return (success) ? successString : failureString;
	}
};