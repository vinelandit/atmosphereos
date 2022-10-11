var https = require('https');
var fs = require('fs');

const moodo = {
  
  apiRoot: "rest.moodo.co",
  endpoint: "/api/boxes",
  key: '',

  // MOODO FUNCTIONS
  getKey() {

    // REQUEST NEW API KEY
    var username = 'samhealy@yahoo.com';
    var password = 'AtmosphereOS';
    // TO DO: request these from front end

    var body = {
      'email': username,
      'password': password
    };
    var data = '';
    var _this = this;


    var req = https.request({
      hostname: this.apiRoot,
      method: 'POST',
      path: this.endpoint,
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
          
        
        if(typeof data !== 'undefined') {
          if(typeof data.token !== 'undefined') {
            // got the API key
            console.log('Acquired Moodo API key '+data['token']);
            _this.key = data['token'];
            // write the moodo key to file
          
            fs.writeFile("./moodokey.txt", moodo['key'],function (err,data) 
             {
                //do stuff
                console.log('Write hue key to file');
             });
            
            _this.getMoodo();
          
          } else if(typeof data.error !== 'undefined') {
            // error, unauthorised?
            
            // send notification message to front-end
            console.log('Moodo authentication error: '+data.error);
            if(atmos.master!==null) {
              var response = {
                "senderAlias" : "SERVER",
                "to" : 'MASTER',
                "command" : "moodo_invalid"
              }
              atmos.master.send(JSON.stringify(response));
              console.log('Sent Moodo error notification to master');
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
    body = JSON.stringify(body);
    console.log(body);
    req.write(body);
    req.end();
  },


  tellMoodo(id,body) {
    
    var token = this.key;

    
    var device_key = null;

    if(typeof this.boxes[id]!=='undefined') {
      device_key = this.boxes[id].device_key;
    } else {
      console.log('Could not find Moodo box with name '+id);
      return false;
    }

    payload = { 
      "device_key": device_key,
      "fan_volume": 100,
      "box_status": 1,
      "settings_slot0": {
        "fan_speed": parseInt(body.slot0),
        "fan_active": true
      },
      "settings_slot1": {
        "fan_speed": parseInt(body.slot1),
        "fan_active": true
      },
      "settings_slot2": {
        "fan_speed": parseInt(body.slot2),
        "fan_active": true
      },
      "settings_slot3": {
        "fan_speed": parseInt(body.slot3),
        "fan_active": true
      }
    };

    
    var data = '';


    var req = https.request({
      hostname: this.apiRoot,
      method: 'POST',
      path: this.endpoint,
      headers: {
        'Content-Type' : 'application/json',
        'Accept' : 'application/json',
        'token' : token
      }
    }, (res) => {
      // A chunk of data has been received.

      res.resume();
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        // console.log(JSON.parse(data).box.settings);
      });
    });

    req.on('error',(error) => {
      console.log(error);
    });
    req.write(JSON.stringify(payload));
    req.end();


    
  },

  getMoodo() {

    // get a list of connected devices

    token = this.key;
    var _this = this;

    var data = '';

    var req = https.request({
      hostname: this.apiRoot,
      method: 'GET',
      path: this.endpoint,
      headers: {
        'Accept' : 'application/json',
        'token' : token
      }
    }, (res) => {
      // A chunk of data has been recieved.

      res.resume();
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        data = JSON.parse(data);
          
        
        if(typeof data.boxes !== 'undefined') {
          _this.boxes = {};
          for(var i=0;i<data.boxes.length;i++) {
            data.boxes[i].name = 'Moodo '+data.boxes[i].name;
            _this.boxes[ data.boxes[i].name ] = data.boxes[i];
            // console.log(_this.boxes);
            _this.refresh();
          }

        }

        if(typeof data.error !== 'undefined') {
          // send notification message to front-end
          console.log('Moodo authentication error: '+data.error);
          if(atmos.master!==null) {
            var response = {
              "senderAlias" : "SERVER",
              "to" : 'MASTER',
              "command" : "moodo_invalid"
            }
            atmos.master.send(JSON.stringify(response));
            console.log('Sent Moodo error notification to master');
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

    req.write('');
    req.end();
  },

  refresh() {
    if(atmos.master!==null) {
      var response = {
        "senderAlias" : "SERVER",
        "to" : 'MASTER',
        "command" : "moodo_refresh",
        "boxes" : this.boxes
      }
      atmos.master.send(JSON.stringify(response));
      console.log('Sent Moodo refresh notification to master');
    }
  },

  start() {
      
      if(fs.existsSync("./moodokey.txt")) {
        var data = fs.readFileSync("./moodokey.txt");
        console.log('Read moodo key '+data+' from file.');
        if(data!='') {
          this.key = data;
        }
      }     

      // initialise
      if(this.key == '') {
        console.log('No Moodo key found, attempting to acquire one...');
        this.getKey();
      } else {
        this.getMoodo();
      }
  }
  


}

if(typeof module !== 'undefined') {
  module.exports = {
    
    'moodo':moodo
    
  }
}