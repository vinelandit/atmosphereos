// Live mode trigger management
const moment = require('../public/js/moment.min.js');
const templates = require('../public/js/actionTemplates.js');
const ejs = require('ejs');
const colour = require('../public/js/colourHelpers.js');
const addToSyncList = require('../public/js/addToSyncList.js');
const csv = require('fast-csv');
const fs = require('fs');
const live = {

    mutedChannels: {},
    project: {},
    accumulatorValues: [], // will contain the values of the accumulators (variables) during the show; any device can set or get their values at any time
    conditionals: [],
    filteredTriggerArray: [],
    attendees: [], // will contain attendees' CSV data for scanning etc.
    syncLists: [],
    timeouts: [],

    sortByTime( a, b ) {
      if ( moment(a.start) < moment(b.start) ){
        return -1;
      } else
      if ( moment(a.start) > moment(b.start )){
        return 1;
      } else {
        if(a.group.toLowerCase().indexOf('hue ')==0||a.group.toLowerCase().indexOf('moodo ')) {
          // demote the hue stuff
          return 1;
        } else {
          return -1;
        }
      }
      return 0;
    },

    doTrigger(data, lastDuration) {
        // console.log('trigger',data);
        var _this = this;
        var hueOffTimeouts = [];
        for (i in data) {

            var t = data[i];
            console.log('PROCESSING TRIGGER ',t.group);

            if (typeof t.duration !== 'undefined' && t.duration > 0) {
                var duration = t.duration * 1000;
            } else {
                var duration = moment(t.end).diff(t.start);
            }
            // first check if this channel is in the muted list
            if (typeof this.mutedChannels[t.group] === 'undefined') {

                var fadeIn = t.fadeIn;
                var fadeOut = t.fadeOut;
                if (typeof fadeIn == 'undefined' || fadeIn == null || fadeIn == '') {
                    fadeIn = 0;
                }
                if (typeof fadeOut == 'undefined' || fadeOut == null || fadeOut == '') {
                    fadeOut = 0;
                }
                fadeIn *= 10;
                fadeOut *= 10; // deciseconds
                if (t.actionID.toLowerCase().indexOf('hue ') == 0) {

                    console.log('matched hue trigger, checking...',t.actionID);

                    if (hue !== null && typeof hue['devices'] !== 'undefined' && typeof hue['devices'][t.group] !== 'undefined') {
                        var id = hue['devices'][t.group].id;
                        // hue action
                        if (t.actionID == 'Hue on') {
                            // console.log('Triggering hue on on device ' + t.group);
                            hue.tellHue(id, {
                                "on": true,
                            });
                        } else {
                            console.log('Triggering hue colour on device ' + t.group);
                            var rgb = colour.hex2rgb(t.color);
                            if (rgb == null) {
                                console.log('Invalid colour value ' + t.color);
                            } else {
                                var hsv = colour.rgb2hsv(rgb.r, rgb.g, rgb.b);
                                var body = {
                                    "on": true,
                                    "hue": hsv[0],
                                    "sat": hsv[1],
                                    "bri": hsv[2],
                                    "transitiontime": fadeIn
                                };
                                // console.log(body);
                                hue.tellHue(id, body);
                            }
                        }
                        // calculate duration
                        if (typeof t.dontTurnOff == 'undefined' && !t.dontTurnOff) {

                            var finalDuration = duration - (fadeOut * 100);
                            var htObject = {
                                'duration': finalDuration,
                                'id': id,
                                'name': t.group,
                                'fadeOut': fadeOut
                            }
                            if (typeof hueOffTimeouts['delay' + finalDuration] == 'undefined') {
                                hueOffTimeouts['delay' + finalDuration] = [];
                            }
                            console.log('adding to hueOffTimeouts: ',finalDuration,htObject);
                            hueOffTimeouts['delay' + finalDuration].push(htObject);

                        } else {
                            // console.log('Not turning off this device');
                        }


                    } else {
                        console.log('failed hue match',t.group,t.actionID);
                    }

                } else if (t.actionID.toLowerCase().indexOf('moodo') == 0) {
                    // console.log('moodo trigger', t);

                    if (moodo !== null && typeof moodo['boxes'] !== null && typeof moodo['boxes'][t.group] !== 'undefined') {
                        var id = moodo['boxes'][t.group].name;
                        // moodo action

                        // console.log('Triggering moodo on device ' + t.group);

                        if (typeof t.moodoSlot0 !== 'undefined') {
                            var body = {
                                "slot0": t.moodoSlot0,
                                "slot1": t.moodoSlot1,
                                "slot2": t.moodoSlot2,
                                "slot3": t.moodoSlot3
                            }
                            // console.log(body);
                            moodo.tellMoodo(id, body);


                            // setup off event
                            // console.log('Setting up moodo off event in ' + duration + ' milliseconds');
                            this.timeouts.push(setTimeout(function(boxid) {

                                var body = {
                                    "slot0": 0,
                                    "slot1": 0,
                                    "slot2": 0,
                                    "slot3": 0
                                }
                                // console.log('This is a timed moodo off event');
                                moodo.tellMoodo(id, body);
                            }.bind(id), duration));
                        }


                    }

                } else {
                    sDuration = duration / 1000;
                    // screen action
                    var target = t.group;
                    var actionID = t.actionID;
                    var fadeIn = t.fadeIn;
                    var fadeOut = t.fadeOut;
                    if (typeof atmos.aliases[target] !== 'undefined') {

                        // console.log('Triggering action ' + t.actionID + ' on device ' + t.group);
                        // console.log('Duration: ' + duration);
                        var c = atmos.clients[atmos.aliases[target]];
                        var response = {
                            "to": target,
                            "command": "action",
                            "actionID": actionID,
                            "duration": sDuration,
                            "fadeIn": fadeIn,
                            "fadeOut": fadeOut,
                            "itemID": t.id
                        }
                        c.send(JSON.stringify(response));
                    }
                }
            } else {
                console.log('Skipping trigger because ' + t.group + ' is currently muted.');
            }
            // console.log('duration: ' + duration);
            if (duration > lastDuration) {
                lastDuration = duration;
            };

        }
        // Hue off requests
        for (i in hueOffTimeouts) { 
            for (j in hueOffTimeouts[i]) {
                var h = hueOffTimeouts[i][j];
                // console.log('Setting up timeout in ' + h.duration + ' on channel ' + h.name + ' (' + h.id + ')');
                this.timeouts.push(setTimeout(hue.turnOffHueDevice, h.duration, h.id, h.fadeOut, hue));
            }
        }
        return lastDuration;
    },

    updateAccumulatorValue(field, value) {
        this.accumulatorValues[field] = value;
        // send to screens
        for (a in atmos.aliases) {
            if (a != 'MASTER') {

                var r = {
                    "to": a,
                    "command": "accumulator",
                    "name": field,
                    "value": value
                }
                myClientID = atmos.aliases[a];
                atmos.clients[myClientID].send(JSON.stringify(r));
            }
        }
    },

    goLive(preview = false) {

        this.accumulatorValues['ctChecked'] = 0;
        var _this = this;
        // Start dispatcher daemon,
        // Send latest assets to screens

        // kill any pre-existing tidy up scheduled task
        if (typeof this.tud !== 'undefined') {
            console.log('Killing pre-existing tidy up scheduled task');
            clearTimeout(this.tud);
            delete this.tud;
        }

        if (this.project !== null) {

            // populate conditionals
            this.conditionals = this.project.conditionals;
            // populate container for accumulators/variables

            for (i in this.project.accumulators) {
                console.log('setting accumulator '+this.project.accumulators[i].name+' to '+this.project.accumulators[i].initVal);
                this.accumulatorValues[this.project.accumulators[i].name] = this.project.accumulators[i].initVal;
                if (this.project.accumulators[i].type == 'text (multiple)') this.accumulatorValues[this.project.accumulators[i].name] = [this.project.accumulators[i].initVal];
            }

            if (typeof this.dispatcherd !== 'undefined') clearInterval(this.dispatcherd);
            if (typeof this.tud !== 'undefined') {
                clearTimeout(this.tud);
                delete this.tud;
            }
            // do we need to read in the attendees' CSV file?
            if (this.project.attendeesFile != '') {
                this.attendees = [];
                var read = fs.createReadStream('./public/csv/' + this.project.attendeesFile)
                    .pipe(csv.parse({
                        headers: true
                    }))
                    .on('data', (row) => {
                        this.attendees.push(row)
                    })
                    .on('end', () => {
                        // now restructure it as an associative array for easy access later
                        var temp = [];
                        var count = 0;
                        for (i in _this.attendees) {
                            var myIndex = 'o' + _this.attendees[i]['Order #'];
                            temp[myIndex] = _this.attendees[i];
                            count++;
                        }
                        _this.attendees = temp;

                        // add special check-in specific accumulators
                        _this.accumulatorValues['ctRemaining'] = count;
                        _this.accumulatorValues['ctTotal'] = count;

                        // send to screens
                        for (a in atmos.aliases) {
                            if (a != 'MASTER') {

                                var r = {
                                    "to": a,
                                    "command": "accumulator",
                                    "name": 'ctChecked',
                                    "value": _this.accumulatorValues['ctChecked']
                                }
                                myClientID = atmos.aliases[a];
                                atmos.clients[myClientID].send(JSON.stringify(r));
                                r = {
                                    "to": a,
                                    "command": "accumulator",
                                    "name": 'ctRemaining',
                                    "value": _this.accumulatorValues['ctRemaining']
                                }
                                atmos.clients[myClientID].send(JSON.stringify(r));
                                r = {
                                    "to": a,
                                    "command": "accumulator",
                                    "name": 'ctTotal',
                                    "value": _this.accumulatorValues['ctTotal']
                                }
                                atmos.clients[myClientID].send(JSON.stringify(r));
                            }
                        }

                    });
            }

            // prepare asset list for each screen

            var targetActions = [];
            for (i in _this.project.timeline.items) {
                var item = _this.project.timeline.items[i];
                var target = item.group;
                var actionID = item.actionID;
                if (typeof actionID !== 'undefined' && target.toLowerCase().indexOf('hue ') != 0 && target.toLowerCase().indexOf('moodo ') != 0) {
                    if (typeof targetActions[target] == 'undefined') {
                        targetActions[target] = [];
                    }
                    targetActions[target][actionID] = actionID;
                }
            }
            // add assets necessary for checkin events
            for (i in _this.project.checkinEvents) {
                var target = _this.project.checkinEvents[i].channel;
                var actionID = _this.project.checkinEvents[i].actionID;
                if (typeof actionID !== 'undefined' && target.toLowerCase().indexOf('hue ') != 0 && target.toLowerCase().indexOf('moodo ') != 0) {
                    if (typeof targetActions[target] == 'undefined') {
                        targetActions[target] = [];
                    }
                    targetActions[target][actionID] = actionID;
                }
            }
            // add assets necessary for cueboard items
            for (i in _this.project.cueboardItems) {
                var target = _this.project.cueboardItems[i].channel;
                var actionID = _this.project.cueboardItems[i].actionID;
                if (typeof actionID !== 'undefined' && target.toLowerCase().indexOf('hue ') != 0 && target.toLowerCase().indexOf('moodo ') != 0) {
                    if (typeof targetActions[target] == 'undefined') {
                        targetActions[target] = [];
                    }
                    targetActions[target][actionID] = actionID;
                }
            }
            // add assets necessary for conditional triggers
            for (i in _this.project.conditionals) {
                var target = _this.project.conditionals[i].channel;
                var actionID = _this.project.conditionals[i].actionID;
                if (typeof actionID !== 'undefined' && target.toLowerCase().indexOf('hue ') != 0 && target.toLowerCase().indexOf('moodo ') != 0) {
                    if (typeof targetActions[target] == 'undefined') {
                        targetActions[target] = [];
                    }
                    targetActions[target][actionID] = actionID;
                }
            }

            // console.log('TARGET ACTIONS: ');
            // console.log(targetActions);


            this.filteredTriggerArray = [];
            this.syncLists = [];
            // assemble the triggers array
            var ta = this.project.timeline.items;
            ta.sort(this.sortByTime);
            var now = new moment();

            // get rid of anything in past
            for (i in ta) {
                var st = moment(ta[i].start);
                var en = moment(ta[i].end);
                if (st.isBefore(now)) {
                    // leave it
                } else {
                    if (st.isAfter(moment(this.project.timeline.options.end))) {
                        // leave it
                    } else {
                        if (en.isBefore(moment(this.project.timeline.options.start))) {
                            // leave it
                        } else {
                            // the main filtered array should exclude frame sync'd events with syncParents defined
                            if (typeof ta[i].syncParent === 'undefined' || ta[i].syncParent == '') {
                                var ts = st.format('x'); // timestamp in milliseconds
                                if (typeof this.filteredTriggerArray[ts + 'ms'] == 'undefined') {
                                    this.filteredTriggerArray[ts + 'ms'] = [];
                                }
                                this.filteredTriggerArray[ts + 'ms'].push(ta[i]);
                            } else {
                                // this item has a sync parent
                                // add to sync list
                                addToSyncList.addToSyncList(i, this.syncLists, ta, st, en, moment);
                                
                            }
                        }
                    }
                }
            }
            // fix Hue lamp race condition: don't change state between adjacent items on the same device
            var hueCheck = [];
            for (var i in this.filteredTriggerArray) {
                for (var j in this.filteredTriggerArray[i]) {
                    var startTime = this.filteredTriggerArray[i][j].start;
                    var endTime = this.filteredTriggerArray[i][j].end;
                    var c = this.filteredTriggerArray[i][j].group;
                    if (c.indexOf('Hue ') == 0) {
                        if (typeof hueCheck[c] == 'undefined') {
                            hueCheck[c] = [];
                        }
                        hueCheck[c].push({
                            'start': startTime,
                            'end': endTime,
                            'id': this.filteredTriggerArray[i][j].id,
                            'timeGroupID': i
                        });

                    }
                }

            }
            for (var h in hueCheck) {
                var next = 1;
                for (var i in hueCheck[h]) {

                    // console.log('Checking ' + next);
                    if (typeof hueCheck[h][next] !== 'undefined') {
                        // compare times
                        if (hueCheck[h][i].end == hueCheck[h][next].start) {
                            // tell event i not to turn off
                            var timeGroupID = hueCheck[h][i].timeGroupID;
                            var id = hueCheck[h][i].id;
                            for (var j in this.filteredTriggerArray[timeGroupID]) {
                                if (this.filteredTriggerArray[timeGroupID][j].id == id) {
                                    this.filteredTriggerArray[timeGroupID][j].dontTurnOff = true;
                                }
                            }
                        }
                    }
                    next++;
                }
            }
            // console.log('Hue check');
            // console.log(hueCheck);
            // console.log(this.filteredTriggerArray);
            // console.log('Initial trigger count: ' + Object.keys(this.filteredTriggerArray).length);
            // console.log(this.syncLists);
            // console.log('Screens with sync lists: ' + this.syncLists.length);

            for (i in targetActions) {
                var myHTML = '';
                var someFonts = false;
                var fontFaces = '';
                var target = i;
                var customFonts = [];

                for (j in targetActions[i]) {
                    var actionID = targetActions[i][j];

                    var action = this.project.actions[actionID];
                    if (typeof action === 'undefined') {
                        console.log('Failed to find action with ID ' + actionID);
                    } else {
                        myHTML += ejs.render(templates.template[action.type], action);

                        if (typeof action.text !== 'undefined') {
                            // check for custom fonts...
                            if (action.text.font.indexOf('.') > -1) {
                                customFonts[action.text.font] = action.text.font;
                                someFonts = true;
                            }
                            if (action.text.additionalFont && action.text.additionalFont.indexOf('.') > -1) {
                                customFonts[action.text.additionalFont] = action.text.additionalFont;
                                someFonts = true;
                            }
                        }

                    }
                }
                if (someFonts) {
                    for (i in customFonts) {
                        fontFaces += `@font-face {
                        font-family:'` + i + `';
                        font-style:normal;
                        src: url(/fonts/` + i + `) format('woff2');
                      }
                      `;
                    }
                }
                // mark up checkin placeholders [[columnName]]
                var ph = myHTML.match(/\[\[.+?\]\]/g);
                if (ph != null) {
                    for (i in ph) {
                        var clean = ph[i].replace('[[', '').replace(']]', '');
                        myHTML = myHTML.replace(ph[i], '<span class="merge" data-replace="' + clean + '">' + ph[i] + '</span>');
                    }
                }
                // mark up accumulator placeholders {{accumulatorName}}
                var ph = myHTML.match(/\{\{.+?\}\}/g);
                if (ph != null) {
                    for (i in ph) {
                        var clean = ph[i].replace('{{', '').replace('}}', '');
                        myHTML = myHTML.replace(ph[i], '<span class="accumulator" data-name="' + clean + '">' + this.accumulatorValues[clean] + '</span>');
                    }
                }

                var syncEvents = 'none';
                // append frame-sync info if appropriate
                if (typeof this.syncLists[target] !== 'undefined') {
                    syncEvents = this.syncLists[target];
                }

                if (typeof atmos.aliases[target] !== 'undefined') {
                    // send the HTML to the target screen
                    var c = atmos.clients[atmos.aliases[target]];
                    // console.log('BORK: ',c,target,atmos.aliases[target]);
                    var response = {
                        "senderAlias": "SERVER",
                        "to": target,
                        "command": "goLive",
                        "html": myHTML,
                        "syncEvents": syncEvents,
                        "fontFaces": fontFaces
                    }
                    // console.log(response);
                    c.send(JSON.stringify(response));


                }




            }


            var k = Object.keys(this.filteredTriggerArray);
            if (k.length) {
                console.log('starting dispatcher');
                var lastDuration = 0;
                this.dispatcherd = setInterval(function() {
                    var k = Object.keys(_this.filteredTriggerArray);

                    var now = new moment();
                    var fk = Object.keys(_this.filteredTriggerArray[k[0]])[0];
                    if (moment(_this.filteredTriggerArray[k[0]][fk].start).isSameOrBefore(now)) {

                        // ready to execute
                        lastDuration = _this.doTrigger(_this.filteredTriggerArray[k[0]], lastDuration);

                        // remove this item
                        delete _this.filteredTriggerArray[k[0]];
                        var rt = Object.keys(_this.filteredTriggerArray).length;
                        // console.log('Remaining triggers: ' + rt);
                        if (rt == 0) {
                            console.log('All triggers processed. Stopping after end of this item');
                            _this.tidyUp(lastDuration);
                            clearInterval(_this.dispatcherd);
                            delete _this.dispatcherd;


                        }
                    }

                }, 125);
            }
            // add: send confirmation back to master
        }
    },

    haltLive() {
        for (a in atmos.aliases) {
            var response = {
                "to": a,
                "command": "haltLive",
                "senderAlias": "SERVER"
            };
            var c = atmos.clients[atmos.aliases[a]];
            if (typeof c !== 'undefined') {
                c.send(JSON.stringify(response));

            }
        }
        // stop dispatcher daemon
        if (typeof this.dispatcherd !== 'undefined') {
            clearInterval(this.dispatcherd);
        }
        if (hue !== null && typeof hue['devices'] !== 'undefined' && hue['devices'] !== null) {
            for (i in hue['devices']) {
                
                // turn off all hue devices
                var body = {
                    "on": false,
                    "bri": 254,
                    "hue": 0,
                    "sat": 254
                };

                hue.tellHue(hue['devices'][i].id, body);
    
            }
        }
        if (moodo !== null && typeof moodo['boxes'] !== 'undefined' && moodo['boxes'] !== null) {
            for (i in moodo['boxes']) {
                // turn off all moodo devices
                var body = {
                    'slot0': 0,
                    'slot1': 0,
                    'slot2': 0,
                    'slot3': 0
                }
                moodo.tellMoodo(moodo['boxes'][i].name, body);

            }
        }

        // cancel all pending timeouts
        for(var i in this.timeouts) {
            clearTimeout(this.timeouts[i]);
        }

        project = {};
        this.mutedChannels = {};

    },

  

    tidyUp(lastDuration) {
      var _this = this;
      // console.log('in tidy up '+lastDuration);
      this.tud = setTimeout(function(){
        console.log('Halting live mode from tidyUp()');
        _this.haltLive();
      },lastDuration);
    },

    scanConditionals() {


      var triggers = [];
      
      // loop through the project's conditional triggers and execute any whose conditions are met
      for(i in this.conditionals) {

        // check for variable markup in value
        var myVal = this.conditionals[i].condition.value;
        var operator = this.conditionals[i].condition.operator;
        var ph = myVal.match(/^\{\{.+?\}\}$/);
        
        if(ph != null) {
           var clean = ph[0].replace('{{','').replace('}}','');
           if(typeof this.accumulatorValues[clean] !== 'undefined') myVal = this.accumulatorValues[clean];
        }
        if(typeof this.conditionals[i].used === 'undefined' || !this.conditionals[i].used) {
          

          var myVar = this.conditionals[i].variable;

          var result = false;


          // console.log('about to compare '+myVar+' ('+this.accumulatorValues[myVar]+') with '+myVal+' using operator '+operator);

          if(operator=='is') {
            result = myVal.toLowerCase()==this.accumulatorValues[myVar].toLowerCase();
          } else if (operator=='isnot') {
            result = myVal.toLowerCase()!=this.accumulatorValues[myVar].toLowerCase();
          } else if (operator=='contains') {
            result = this.accumulatorValues[myVar].toLowerCase().indexOf(myVal.toLowerCase())>-1;
          } else if (operator=='doesnotcontain') {
            result = this.accumulatorValues[myVar].toLowerCase().indexOf(myVal.toLowerCase())==-1;
          } else if (operator=='isatleast') {
            result = parseFloat(this.accumulatorValues[myVar]) >= parseFloat(myVal);
          } else if (operator=='isatmost') {
            result = parseFloat(this.accumulatorValues[myVar]) <= parseFloat(myVal);
          }  
          // console.log('Result: '+result);
          if(result) {
            // add to triggers list
            this.conditionals[i].group = this.conditionals[i].channel;
            triggers.push(this.conditionals[i]);

            console.log('CONDITION MET!',this.conditionals[i]); 


            if(this.conditionals[i].mode=='once') delete this.conditionals[i]; // remove trigger from list
          }        
        }

      }
      // console.log('Active conditional triggers: ');
      // console.log(triggers);
      // execute triggers
      var t = this.doTrigger(triggers,0);
    }


};




if (typeof module !== 'undefined') {
    module.exports = {

        'live': live

    }
}