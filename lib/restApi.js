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
			var req = http.request(options, res => {
				var responseString = "";
				res.on('data', data => responseString += data);
				res.on('end', () => resolve(JSON.parse(responseString)));
			})
			.on('error', err => reject(err));

			body = JSON.stringify(body);
	 		if (typeof body !== "undefined") req.write(body);
	 		req.end();
		});
		
	},

	respond: function(response, message, err) {
		logger(message, err);
		response.send(message);
	},

	processRooms: function(query) {
		const ALL_ROOMS = ["bed","bath","kitchen","living"];
		let retVal = [];

		if (query && query === 'all') retVal = ALL_ROOMS
		else if (query && query.charAt(0) === '[') retVal = JSON.parse(query)
		else if (query) retVal[0] = query
		else retVal = ALL_ROOMS;

		for (let i = 0; i < retVal.length; i++) {
			retVal[i] = normalize(retVal[i]);
		}

		return retVal;
	},

	responseMessage: function(rooms, verb, success) {
		const successString = `Success with ${verb} in the`;
		const failureString = `Problem with ${verb} in the`;
		var retVal = (success) ? successString : failureString;

		if (rooms.length === 1) retVal = `${retVal} ${formatRoom(rooms[0])}`
		else {
			for (let i = 0; i < rooms.length; i++) {
				if (i === 0) retVal = `${retVal} ${formatRoom(rooms[i])}`
				else if (i+1 === rooms.length) retVal = `${retVal}, and ${formatRoom(rooms[i])}`
				else retVal = `${retVal}, ${formatRoom(rooms[i])}`
			}
		}
		return retVal;
	}
};