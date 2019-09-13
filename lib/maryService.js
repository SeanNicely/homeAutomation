var utils = require('./utils.js');
var chalk = require('chalk');
var mongo = require('./mongoApi.js');
var rest = require('./restApi.js');

var getAllDateIdeas = async function(query) {
    return new Promise((resolve, reject) => {
        mongo.findAll("dateIdeas", query)
        .then(data => resolve(data),err => reject(err));
    });
}

var getDates = async function(query) {
    query = query || {};
    let dateData = await getAllDateIdeas(query);
    return dateData;
}

maryService = module.exports = {
    getDates
}