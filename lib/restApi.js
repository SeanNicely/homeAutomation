var http = require('http');

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
			.on('error', err => console.error('Error with the request:', err.message));

			body = JSON.stringify(body);
	 		if (typeof body !== "undefined") req.write(body);
	 		req.end();
		});
	},

	respond: function(response, message, err) {
		err ? console.log(err) : console.log(message);
		response.send(message);
	}
};