var rest = require('./restApi.js');

// Trello Constants
const ShoppingListBoardID = "57bca36cfd59fb00777c3f45";

var formatName = function(name) {
  return name.toLowerCase().replace(/-/g,"").replace(/\s+/g,"");
}

var getAllCards = function() {
  return new Promise((resolve, reject) => {
    //let options = new URL('https://api.trello.com/1/boards/57bca36cfd59fb00777c3f45?key=f599bf94b723f4144d609bc8078068ab&token=8caeebb86ee79a0290e9a9a3bf462b11d5b90075c5c5e0641aeb1758cd8a509a');
    let options = new rest.TrelloOptions("GET", "boards/"+ShoppingListBoardID + "/cards");
    //let options = new rest.TrelloOptions("GET", "members/me/boards");
    rest.httpsRequest(options)
        .then(resolve, reject);
  });
}

var getCardByName = async function(name) {
  let retval = {};
  name = formatName(name);
  let allCards = await getAllCards();
  for (let card of allCards) {
    if (name === formatName(card.name)) {
      retval = card;
      break;
    }
  }
  return retval;
}

//console.log(JSON.stringify(getCardByName("apples")));
