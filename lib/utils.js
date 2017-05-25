module.exports = {
	normalize: function(str) {
  		return str.toLowerCase().replace(/the/g,"").replace(/\s+/g,"").replace(/room/g,"");
	},

	logger: function(message, err) {
		err ? console.log(new Date().toLocaleTimeString(), err) : console.log(new Date().toLocaleTimeString(), message);
	}
}