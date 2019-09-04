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

var formatDateData = function(dates) {
    let openingTags = "<!DOCTYPE html><html><body>";
    let closingTags = "</body></html>";
    let formattedDates = openingTags;
    for (let date of dates) {
        for (const [attribute, value] of Object.entries(date)) {
            formattedDates += `<span><strong> ${attribute}: </strong> ${value}</span><br>`;
        }
        formattedDates += "<br>";
    }
    formattedDates += closingTags;
    return formattedDates;
}

var getDates = async function(query) {
    query = query || {};
    let dateData = await getAllDateIdeas(query);
    dateData = formatDateData(dateData);
    return dateData;
}

maryService = module.exports = {
    getDates
}