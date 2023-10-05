var https = require('https');

const eb = {
  options: {
    host: 'www.eventbriteapi.com',
    path: '/v3/events/{{EVENTID}}/',
    port: '443',
    method: 'GET',
    //This is the only line that is new. `headers` is an object with the headers to request
    headers: {'Authorization': 'Bearer {{PRIVATEKEY}}'}

  },

  eventID: null,
  privateKey: null,
  initTimer: null,

  getEvent: function() {
    const _this = this;
    const reqOptions = this.options;
    var body = '';
    const reqObj = https.request(reqOptions, res => {
      res.on('data', chunk => {
        body += chunk;
      });
      res.on('end', () => {
        body = JSON.parse(body);
        _this.event = body;
        console.log('received event details');
      })
    });
    reqObj.on('error', e => {
      console.error(e);
    });
    reqObj.end();
  },

  validate: async function(barcode) {
  
    // validate and get metadata on attendee
    barcode = this.parseBarcode(barcode);
    console.log(barcode);


    if(!barcode.attendeeID) {
      console.error('missing barcode data');
      return JSON.stringify({ 'error': 'Invalid or missing barcode '+barcode });
    }

    if(this.eventID==null || this.privateKey==null) {

      console.error('No eventBrite information received from front-end!');
      return JSON.stringify({ 'error': 'EventBrite connection data missing. Please refresh the Atmosphere web interface and try again.'});
    }

    const reqOptions = {...this.options};
    reqOptions.path += 'attendees/'+barcode.attendeeID+'/';



    const requestPromise = (reqOptions) => new Promise((resolve, reject) => {
      var body = '';
      const reqObj = https.request(reqOptions, res => {
        res.on('data', chunk => {
          body += chunk;
        });
        res.on('end', () => {
          res.body = body;
          console.log('resolving promise');
          resolve(res);
        })
      });
      reqObj.on('error', e => {
        reject(e);
      });
      reqObj.end();
    });

    try {
      const res = await requestPromise(reqOptions);
      return res.body;
    } catch (e) {
      console.error(e);
    }

 
  },

  init: function() {
    const _this = this;
    if(live.project == null || typeof live.project.eventBriteEventID == 'undefined' || typeof live.project.eventBritePrivateKey == 'undefined') {
      /* this.initTimer = setTimeout(function(){
        console.log('Re-checking eventBrite info...');
        _this.init();

      },3000);
      */
    } else {
      if(this.initTimer!=null) {
        clearTimeout(this.initTimer);
      }
      // all data required, initialise
      this.eventID = live.project.eventBriteEventID;
      this.privateKey = live.project.eventBritePrivateKey;
      this.options.path = this.options.path.replace('{{EVENTID}}',this.eventID);
      this.options.headers.Authorization = this.options.headers.Authorization.replace('{{PRIVATEKEY}}',this.privateKey);
      console.log('EventBrite API object ready.');
      console.log(this.options);
      this.ready = true;
      this.getEvent();
    }
  },

  parseBarcode(barcode) {
    if(barcode.length!=23) {
      return { 'error': 'Invalid barcode length.' }
    } else {
      return {
        'orderID':barcode.slice(0,10),
        'attendeeID':barcode.slice(10,20),
        'sequence':barcode.slice(20,23)
      }
    }
  }

}


if(typeof module !== 'undefined') {
  module.exports = {
    
    'eb':eb
    
  }
}