var rest = require('./restApi.js');

// Trello Constants
const ShoppingListBoardID = "57bca36cfd59fb00777c3f45";

var formatName = function(name) {
  return name.toLowerCase().replace(/-/g,"").replace(/\s+/g,"").replace(/es$|s$/$,"");
}

var getAllCards = function() {
  return new Promise((resolve, reject) => {
    let options = new rest.TrelloOptions("GET", "boards/"+ShoppingListBoardID);
    rest.request(options)
    .then(resolve, reject);
  }
}

var getCardByName = async function(name) {
  retval = {};
  name = formatName(name);
  let allCards = await getAllCards();
  for (let card in allCards) {
    if (name === formatName(card.name)) {
      retval = card;
      break;
    }
  }
  return retval;
}

modules.exports = {
  getAllCards
};
