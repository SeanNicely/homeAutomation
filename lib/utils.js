var fs = require('fs');

module.exports = {
	normalize: function(str) {
  		return str.toLowerCase().replace(/the/g,"").replace(/\s+/g,"").replace(/room/g,"");
	},

	logger: function(message) {
		let d = new Date();
		message = d.toDateString() + ' ' + d.toLocaleTimeString() + ' ' + message;
		console.log(message);
		fs.appendFile('debug.log', message + '\n', (err) => {if (err) throw err});
	}
}