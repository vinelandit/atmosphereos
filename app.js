// Port where we'll run the websocket server
const webSocketsServerPort = 1337;
const expressPort = 3000;
// const open = require('open');

// Register local IP so users can be redirected from https://ray.scot/atmos ultimately atmosphere.co/[eventcode]
mapIP = require('./inc/mapIP.js').mapIP;
mapIP.start(expressPort,webSocketsServerPort);
/* const os = require('os');
const ifaces = os.networkInterfaces();
console.log(ifaces);
*/


// Express Web Server object for front end
const app = require('./inc/webapp.js').setup(webSocketsServerPort,expressPort);



/*** GLOBAL OBJECTS ***/

// Phillips Hue object
hue = require('./inc/hue.js').hue;
// hue.search();
hue.manualInit();

// Moodo stinkbox object
moodo = require('./inc/moodo.js').moodo;
moodo.start();

// Live mode object
live = require('./inc/liveFuncs.js').live;

// Main Atmos Websocket server
atmos = require('./inc/atmosServer.js').atmos;
atmos.start(webSocketsServerPort);

eb = require('./inc/eventBriteAPI.js').eb;
// eb.init();




/*** END GLOBAL OBJECTS ***/


// open.openApp(open.apps.chrome);


module.exports = app;