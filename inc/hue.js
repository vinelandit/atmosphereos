var http = require('http');
var Client = require('node-ssdp').Client;
var fs = require('fs');

const hue = {
  
  // PHILIPS HUE FUNCTIONS
  sendHueList() {
    if(atmos.master!==null) {
      var out = [];
      if(this.devices) {
        for(i in this.devices) {

          out.push(i);
        }
         var response = {
          "senderAlias" : "SERVER",
          "to" : 'MASTER',
          "command" : "hue_manifest_response",
          "manifest" : out
        }
        atmos.master.send(JSON.stringify(response));
        // console.log('Sent Hue device list to master');
      }
     
    }
  },


  initHue() {
    var _this = this;
    var body = '{"devicetype":"atmos#master"}';
    var data = '';
    var req = http.request({
      host: this.ip,
      port: this.port,
      method: 'POST',
      path: this.api,
      headers: {
        'Content-Type' : 'application/json',
        'Accept' : 'application/json'
      }
    }, (res) => {
      // A chunk of data has been recieved.

      res.resume();
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        data = JSON.parse(data);
          
        
        if(typeof data[0] !== 'undefined') {
          if(typeof data[0].success !== 'undefined') {
            // got the API key
            console.log('Acquired Hue API key '+data[0]['success']['username']);
            _this.key = data[0]['success']['username'];
            // write the hue key to file
          
           fs.writeFile("./huekey.txt", this.key,function (err,data) 
           {
              //do stuff
              console.log('Write hue key to file');
           });
            

            _this.updateHueList();
          } else if(typeof data[0].error !== 'undefined') {
            // error, unauthorised?
            if(data[0].error.description=='link button not pressed') {
              // send notification message to front-end, then start checking again
              console.log(data[0],'Please press the button on your Philips Hue Bridge.');
              if(atmos.master!==null) {
                var response = {
                  "senderAlias" : "SERVER",
                  "to" : 'MASTER',
                  "command" : "hue_press_button"
                }
                atmos.master.send(JSON.stringify(response));
                console.log('Sent Hue button notification to master');
              }
              var retryHue = setTimeout(function(){
                _this.initHue();
              },2000);
            }
          }
        }
        if (!res.complete)
          console.error(
            'The connection was terminated while the message was still being sent');
      });
    });

    req.on('error',(error) => {
      console.log(error);
    });
    req.write(body);
    req.end();
  },

  tellHue(id,body) {
    

    body = JSON.stringify(body);
    
    var data = '';
    var req = http.request({
      host: this.ip,
      port: this.port,
      method: 'PUT',
      path: this.api+this.key+'/lights/'+id+'/state',
      headers: {
        'Content-Type' : 'application/json',
        'Accept' : 'application/json'
      }
    }, (res) => {
      // A chunk of data has been received.

      res.resume();
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        /* data = JSON.parse(data);
          
        
        if(typeof data[0] !== 'undefined') {
          if(typeof data[0].success !== 'undefined') {
            // success
          } else if(typeof data[0].error !== 'undefined') {
            // error
            console.log('Error sending command to hue device '+id+': '+data[0].error.description);
            
          }
        }
        if (!res.complete)
          console.error(
            'The connection was terminated while the message was still being sent');
        */
      });
    });

    req.on('error',(error) => {
      console.log(error);
    });
    req.write(body);
    req.end();


    
  },

  updateHueList() {
    
    var data = '';
    var req = http.request({
      host: this.ip,
      port: this.port,
      method: 'GET',
      path: this.api+this.key+'/lights',
      headers: {
        'Content-Type' : 'application/json',
        'Accept' : 'application/json'
      }
    }, (res) => {
      // A chunk of data has been recieved.

      res.resume();
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(data);
        data = JSON.parse(data);
        if(typeof data[0] !== 'undefined' && typeof data[0].error !== 'undefined' && data[0].error.description=='unauthorized user') {
          // expired key, request new one
          console.log('Deleting expired hue key '+this.key);
          delete this.key;
          this.initHue();
        } else {
          this.devices = [];
          this.unavailableDevices = [];
          for(i in data) {
            var temp = [];
            if(data[i].name.indexOf('Hue ')!=0) {
              temp.prefix = 'Hue ';
            } else {
              temp.prefix = '';
            }
            temp.id = i;
            temp.type= data[i].type;

            if(data[i].state.reachable) {
              this.devices[data[i].name] = temp;
            } else {
              this.unavailableDevices[data[i].name] = temp;
            }
          }
          console.log(hue);
          // send list to master
          this.sendHueList();
        }
        
        if (!res.complete)
          console.error(
            'The connection was terminated while the message was still being sent');
      });
    });

    req.on('error',(error) => {
      console.log(error);
    });
    req.write('');
    req.end(); 
  },


  manualInit() {
    this.host = 'http://192.168.2.19';
    this.host = 'http://192.168.3.3';
    this.ip = '192.168.2.19';
    this.ip = '192.168.3.3';
    this.port = '80';
    this.api = '/api/';
    var data = fs.readFileSync("./huekey.txt");
    console.log('Read hue key '+data+' from file.');
    if(data!='') {
      this.key = data;
    }
    if(typeof this.key==='undefined') {
      this.initHue();
    } else {
      this.updateHueList();
    }
  },

  search() {
    this.client = new Client();
    /* FIND UPnP DEVICES */
    var _this = this;

    this.client.on('response', function (headers, statusCode, rinfo) {
      // console.log(headers['SERVER']);
      // console.log('Received ssdp response',headers,statusCode,rinfo);
      if(headers['SERVER'].indexOf('IpBridge')>-1 && typeof _this.host == 'undefined') {
        // found Phlips Hue Bridge
        
        _this.server = headers['SERVER'];
        // parse the IP
        var temp = headers['LOCATION']+'';
        temp = temp.split('\/\/');
        var protocol = temp[0];
        temp = temp[1].split('/');
        var temp2 = temp[0].split(':');

        _this.host = protocol+'//'+temp2[0];
        _this.ip = temp2[0];
        _this.api = '/api/';

        _this.port = temp2[1];


        if(fs.existsSync("./huekey.txt")) {
          var data = fs.readFileSync("./huekey.txt");
          console.log('Read hue key '+data+' from file.');
          if(data!='') {
            _this.key = data;
          }
        }
          

        // initialise
        if(typeof _this.key==='undefined') {
          _this.initHue();
        } else {
          _this.updateHueList();
        }

        clearInterval(_this.uPnPDaemon);
      }
      var myKey = headers['SERVER'];
      var now = Date.now();
      headers.lastHeartbeat = now;
      
      /* 
      iotDevices[myKey] = headers;

      // remove devices that haven't been seen in a while
      for(i in iotDevices) {
        if(iotDevices[i].lastHeartbeat < (now-10000)) {
          console.log('Removing stale IoT device '+i);
          delete(iotDevices[i]);
        }
      }
      */
    });  


    this.uPnPDaemon = setInterval(function(){
      console.log('searching for Philips Hue Bridge...')
      _this.client.search('ssdp:all');
    },3000);
  },

  turnOffHueDevice(id,fadeOut,h){
    // console.log('Turning off '+id+' after  '+fadeOut+' fadeout');
    h.tellHue(id,{
      "on":false,
      "transitiontime":fadeOut
    });
  },


}

if(typeof module !== 'undefined') {
  module.exports = {
    
    'hue':hue
    
  }
}