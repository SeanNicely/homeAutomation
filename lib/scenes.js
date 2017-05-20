var mongo = require('./mongoApi.js');
var hueApi = require('./HueApi.js');

module.exports = {
	setScene: function(scene) {
		return new Promise((resolve, reject) => {
			mongo.find('scenes', {"name":scene})
			.then(sceneData => {
				console.log("sceneData", sceneData)
				sceneData.lights.forEach(light => {
					console.log("light", light)
					hueApi.setLightState(light.id, light.body)
				});
			}, err => reject(err));
		});
	}
}