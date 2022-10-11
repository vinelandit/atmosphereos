// tell server what local IP and ports to redirect to
const os = require('os');
const ifaces = os.networkInterfaces();

console.log(ifaces);

const http = require('http');
const https = require('https');
const mapIP = {
  count: 0,
  localIP: '',
  expressPort: 0,
  start(expressPort,webSocketsServerPort) {
    var _this = this;
    this.expressPort = expressPort;
    Object.keys(ifaces).forEach(function (ifname) {
      var alias = 0;

      ifaces[ifname].forEach(function (iface) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
          // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
          return;
        }

        if (alias >= 1) {
          // this single interface has multiple ipv4 addresses
          console.log(ifname + ':' + alias, iface.address);
        } else {
          // this interface has only one ipv4 adress
          
          if(_this.localIP=='') {
            console.log(ifname, iface.address);
            _this.localIP = iface.address;
          }
          
        }
        ++alias;
      });
      _this.count++;
    });

    
    (async (url) => {
        console.log(await _this.getScript(url));
    })('https://ray.scot/atmos/?key=hup&lanIP='+_this.localIP+'&httpPort='+expressPort+'&wsPort='+webSocketsServerPort);
  },
  getScript(url) {
      return new Promise((resolve, reject) => {
          

          let client = http;

          if (url.toString().indexOf("https") === 0) {
              client = https;
          }

          client.get(url, (resp) => {
              let data = '';

              // A chunk of data has been recieved.
              resp.on('data', (chunk) => {
                  data += chunk;
              });

              // The whole response has been received. Print out the result.
              resp.on('end', () => {
                  resolve(data);
              });

          }).on("error", (err) => {
              reject(err);
          });
      });
  }
};


if(typeof module !== 'undefined') {
  module.exports = {
    
    'mapIP':mapIP
    
  }
}