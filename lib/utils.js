var fs = require('fs');

module.exports = {
	normalize: function(str) {
  		return str.toLowerCase().replace(/the/g,"").replace(/\s+/g,"").replace(/room/g,"");
	},

	logger: function(message, err) {
    err = err || "";
		let d = new Date();
		date = d.toDateString() + ' ' + d.toLocaleTimeString();
		console.log(date, message, err);
		fs.appendFile('debug.log', date + ' - ' + message + err + '\n', (err) => {if (err) throw err});
	},

	pluralize: function(method, lights, body) {
  		var lightQueue = [];

  		if (body) {
  			lights.forEach(light => {
	    		lightQueue.push(method(light, body));
  			});
  		} else if (Object.prototype.toString.call(lights) === "[object Array]" && Object.prototype.toString.call(lights[0]) === "[object Object]") {
  			lights.forEach(light => {
  				lightQueue.push(method(light.id, light.body));
  			});
  		} else {
        lights.forEach(light => {
          lightQueue.push(method(light));
        });
      }

  		return new Promise((resolve, reject) => {
    		Promise.all(lightQueue)
    		.then(resolve, reject);
  		});
	},

  curryIt: function(uncurried) {
    var parameters = Array.prototype.slice.call(arguments, 1);
    return function() {
      return uncurried.apply(this, parameters.concat(
        Array.prototype.slice.call(arguments, 0)
      ));
    }
  }
}