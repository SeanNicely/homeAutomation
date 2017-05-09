function httpRequest(method, url, body){
  var xhttp = new XMLHttpRequest();
  var response = "unsuccessful";
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      response = this.responseText;
    }
  };
  xhttp.open(method, url, false);
  xhttp.send(body);
  return response;
}

function getLights(room) {
  var lights;
  
  switch (room.toLowerCase().replace(/\s/g,"")) {
    case "livingroom":
    case "living":
      lights = [1,2,4];
      break;
    case "bedroom":
    case "bed":
      lights = [5,6];
      break;
    default:
      lights = [1,2,4,5,6];
  }
  return lights;
}

function getUrl(type, light) {
  var baseUrl = "http://192.168.1.190/api/uDe4zdFPK-kklfaxTh3RFG6Kwe4EDyiSxwjXB5eg";
  type = "/"+type;
  light = "/"+light;
  
  return baseUrl + type + light + "/state";
}

function getDiscrete(body, action){
  action = action.toLowerCase().replace(/\s/g,"");
  switch (action) {
    case "on":
      body.on = true;
      break;
    case "off":
      body.on = false;
      break;
    default:
      body.xy = getColor(action);
  }
  return body;
}

function getContinuous(body, action, percentage) {
  percentage = parseInt(percentage);
  switch (action) {
    case "brightness":
      percentage = Math.floor(255*percentage/100);
      body["bri"] = percentage;
      break;
    case "temperature":
      percentage = Math.floor(347*percentage/100 + 153);
      body["ct"] = percentage;
      break;
    case "saturation":
      percentage = Math.floor(255*percentage/100);
      body["sat"] = percentage;
      break;
  }
  return body;
}

function getCurrentState(lights) {
    var states = {};
    
    lights.forEach(function(light){
        var url = "http://192.168.1.190/api/uDe4zdFPK-kklfaxTh3RFG6Kwe4EDyiSxwjXB5eg/lights/" + light;
        states[light] = JSON.parse(httpRequest("GET", url));
    });
    return states;
}

function setOnStatus(body, lights) {
    var currentStates = getCurrentState(lights);
    for (var light in currentStates){
        lightState = currentStates[light].state;
        if (!lightState.on) body.on = true;
    }
    return body;
}

function hueAPI(urlInfo, body) {
  urlInfo.lights.forEach(function(light){
    var url = getUrl(urlInfo.type, light);
    var response = httpRequest(urlInfo.httpMethod, url, JSON.stringify(body));
    console.log(response);
  });
}

function main() {
  var urlInfo = {};
  var body = {};
  
  if (typeof scene !== "undefined") {
    //TODO
    /*
      urlInfo.type = "scene";
    */
  }
  else {
    urlInfo.lights = getLights(room);
    body = setOnStatus(body, urlInfo.lights);
    body = typeof percentage !== "undefined" ? getContinuous(body, action, percentage) : getDiscrete(body, action);
    console.log(body);
    urlInfo.type = "lights";
    urlInfo.modifier = "state";
    urlInfo.httpMethod = "PUT";
  }
  
  hueAPI(urlInfo, body);
}

main();



function getColor(color) {
  var colorTable = {
	aliceblue: [0.3092,0.321],
	antiquewhite: [0.3548,0.3489],
	aqua: [0.2858,0.2747],
	aquamarine: [0.3237,0.3497],
	azure: [0.3123,0.3271],
	beige: [0.3402,0.356],
	bisque: [0.3806,0.3576],
	black: [0.168,0.041],
	blanchedalmond: [0.3695,0.3584],
	blue: [0.168,0.041],
	blueviolet: [0.251,0.1056],
	brown: [0.6399,0.3041],
	burlywood: [0.4236,0.3811],
	cadetblue: [0.2961,0.295],
	chartreuse: [0.408,0.517],
	chocolate: [0.6009,0.3684],
	coral: [0.5763,0.3486],
	cornflower: [0.2343,0.1725],
	cornsilk: [0.3511,0.3574],
	crimson: [0.6417,0.304],
	cyan: [0.2858,0.2747],
	darkblue: [0.168,0.041],
	darkcyan: [0.2858,0.2747],
	darkgoldenrod: [0.5204,0.4346],
	darkgray: [0.3227,0.329],
	darkgreen: [0.408,0.517],
	darkkhaki: [0.4004,0.4331],
	darkmagenta: [0.3824,0.1601],	
	darkolivegreen: [0.3908,0.4829],
	darkorange: [0.5916,0.3824],
	darkorchid: [0.2986,0.1341],
	darkred: [0.674,0.322],
	darksalmon: [0.4837,0.3479],
	darkseagreen: [0.3429,0.3879],
	darkslateblue: [0.2218,0.1477],
	darkslategray: [0.2982,0.2993],
	darkturquoise: [0.2835,0.2701],
	darkviolet: [0.2836,0.1079],
	deeppink: [0.5386,0.2468],
	deepskyblue: [0.2428,0.1893],
	dimgray: [0.3227,0.329],
	dodgerblue: [0.2115,0.1273],
	firebrick: [0.6566,0.3123],
	floralwhite: [0.3361,0.3388],
	forestgreen: [0.408,0.517],
	fuchsia: [0.3824,0.1601],
	gainsboro: [0.3227,0.329],
	ghostwhite: [0.3174,0.3207],
	gold: [0.4859,0.4599],
	goldenrod: [0.5113,0.4413],
	gray: [0.3227,0.329],
	webgray: [0.3227,0.329],
	green: [0.408,0.517],
	webgreen: [0.408,0.517],
	greenyellow: [0.408,0.517],
	honeydew: [0.3213,0.345],
	hotpink: [0.4682,0.2452],
	indianred: [0.5488,0.3112],
	indigo: [0.2437,0.0895],
	ivory: [0.3334,0.3455],
	khaki: [0.4019,0.4261],
	lavender: [0.3085,0.3071],
	lavenderblush: [0.3369,0.3225],
	lawngreen: [0.408,0.517],
	lemonchiffon: [0.3608,0.3756],
	lightblue: [0.2975,0.2979],
	lightcoral: [0.5075,0.3145],
	lightcyan: [0.3096,0.3218],
	lightgoldenrod: [0.3504,0.3717],
	lightgray: [0.3227,0.329],
	lightgreen: [0.3682,0.438],	
	lightpink: [0.4112,0.3091],
	lightsalmon: [0.5016,0.3531],
	lightseagreen: [0.2946,0.292],
	lightskyblue: [0.2714,0.246],
	lightslategray: [0.2924,0.2877],
	lightsteelblue: [0.293,0.2889],
	lightyellow: [0.3436,0.3612],
	lime: [0.408,0.517],
	limegreen: [0.408,0.517],
	linen: [0.3411,0.3387],
	magenta: [0.3824,0.1601],
	maroon: [0.5383,0.2566],
	webmaroon: [0.674,0.322],
	mediumaquamarine: [0.3224,0.3473],
	mediumblue: [0.168,0.041],
	mediumorchid: [0.3365,0.1735],
	mediumpurple: [0.263,0.1773],
	mediumseagreen: [0.3588,0.4194],
	mediumslateblue: [0.2189,0.1419],
	mediumspringgreen: [0.3622,0.4262],
	mediumturquoise: [0.2937,0.2903],
	mediumvioletred: [0.5002,0.2255],
	midnightblue: [0.1825,0.0697],
	mintcream: [0.3165,0.3355],
	mistyrose: [0.3581,0.3284],
	moccasin: [0.3927,0.3732],
	navajowhite: [0.4027,0.3757],
	navyblue: 	[0.168,0.041],
	oldlace: [0.3421,0.344],
	olive: [0.4317,0.4996],
	olivedrab: [0.408,0.517],
	orange: [0.5562,0.4084],
	orangered: [0.6733,0.3224],
	orchid: [0.3688,0.2095],
	palegoldenrod: [0.3751,0.3983],
	palegreen: [0.3657,0.4331],
	paleturquoise: [0.3034,0.3095],
	palevioletred: [0.4658,0.2773],
	papayawhip: [0.3591,0.3536],
	peachpuff: [0.3953,0.3564],
	peru: [0.5305,0.3911],
	pink: [0.3944,0.3093],	
	plum: [0.3495,0.2545],
	powderblue: [0.302,0.3068],
	purple: [0.2725,0.1096],
	webpurple: [0.3824,0.1601],
	rebeccapurple: [0.2703,0.1398],
	red: [0.674,0.322],
	rosybrown: [0.4026,0.3227],
	royalblue: [0.2047,0.1138],
	saddlebrown: [0.5993,0.369],
	salmon: [0.5346,0.3247],
	sandybrown: [0.5104,0.3826],
	seagreen: [0.3602,0.4223],
	seashell: [0.3397,0.3353],
	sienna: [0.5714,0.3559],
	silver: [0.3227,0.329],
	skyblue: [0.2807,0.2645],
	slateblue: [0.2218,0.1444],
	slategray: [0.2944,0.2918],
	snow: [0.3292,0.3285],
	springgreen: [0.3882,0.4777],
	steelblue: [0.248,0.1997],
	tan: [0.4035,0.3772],
	teal: [0.2858,0.2747],
	thistle: [0.3342,0.2971],
	tomato: [0.6112,0.3261],
	turquoise: [0.2997,0.3022],
	violet: [0.3644,0.2133],
	wheat: [0.3852,0.3737],
	white: [0.3227,0.329],
	whitesmoke: [0.3227,0.329],
    yellow: [0.4317,0.4996],
    yellowgreen: [0.408,0.517]
  };

  return typeof colorTable[color] == "object" ? colorTable[color] : "error";
}