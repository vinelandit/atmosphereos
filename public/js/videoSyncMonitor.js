
function stopVideoSync(obj) {
	obj.stopListen();
}

function sendTestAction(i, target, connection, duration = false) {
  var a = project.getAction(i.actionID);

  if(duration) a.duration = duration;
  a.fadeIn = i.fadeIn;
  a.fadeOut = i.fadeOut;


  console.log('test duration', a.duration);
  var customFonts = [];
  var someFonts = false;
  var fontFaces = '';

  if(typeof a.text !== 'undefined') {
    // check for custom fonts...
    if(a.text.font.indexOf('.')>-1) {

      someFonts = true;
      customFonts[a.text.font] = a.text.font;
    }
    if(typeof a.text.additionalFont !== 'undefined' && a.text.additionalFont.indexOf('.')>-1) {
      someFonts = true;
      customFonts[a.text.additionalFont] = a.text.additionalFont;
    }
  }
  if(someFonts) {
    for(j in customFonts) {
      var temp = j.split('.');
      var format = temp[1];
      fontFaces += `@font-face {
        font-family:'`+i+`';
        src: url(/fonts/`+i+`) format('`+format+`');
      }
      `;
    }
  }
  testAction(connection,target,i.actionID,ejs.render(template[a.type],a),a.duration,a.fadeIn,a.fadeOut,fontFaces);

}
function videoSyncMonitor(itemID, videoID, mySyncEvents, connection, myID) {
    // there are some sync events, put them in the right place
    liveSyncList = [];
    for (var key in mySyncEvents[itemID]) {
        liveSyncList.push(mySyncEvents[itemID][key]);
    }

    // sort out Hue device race conditions

    var hueCheck = {};
    for (var i in liveSyncList) {
        var startTime = liveSyncList[i].time;
        for (var a in liveSyncList[i].actions) {
            if (liveSyncList[i].actions[a].actionID.indexOf('Hue ') == 0) {
                // hue event
                if (typeof hueCheck[liveSyncList[i].actions[a].to] == 'undefined') {
                    hueCheck[liveSyncList[i].actions[a].to] = {};
                }
                if (typeof hueCheck[liveSyncList[i].actions[a].to][i] == 'undefined') {
                    hueCheck[liveSyncList[i].actions[a].to][i] = [];
                }
                var temp = [];
                var endTime = startTime + (liveSyncList[i].actions[a].duration * 1000);
                temp['startTime'] = startTime;
                temp['endTime'] = endTime;
                temp['originalIndex'] = a;

                hueCheck[liveSyncList[i].actions[a].to][i].push(temp);
            }
        }
    }

    for (var channel in hueCheck) {
        var myKeys = Object.keys(hueCheck[channel]);
        var myCount = myKeys.length;
        var index = 0;
        for (var i in hueCheck[channel]) {



            for (var j in hueCheck[channel][i]) {
                var firstEnd = hueCheck[channel][i][j].endTime;
                var firstStart = hueCheck[channel][i][j].startTime;
            }
            var next = myKeys[index + 1];
            console.log(next);
            if (typeof hueCheck[channel][next] !== 'undefined') {
                var myActionName = '';
                for (var j in hueCheck[channel][next]) {
                    myActionName = j;
                }
                var secondStart = hueCheck[channel][next][myActionName].startTime;
                var secondEnd = hueCheck[channel][next][myActionName].endTime;
                console.log('Comparing ' + firstEnd + ' to ' + secondStart);
                if (secondStart != firstEnd) {
                    // flag left abutting event not to turn device off
                    // flag right abutting event not to turn device on

                    for (repatch in liveSyncList[i].actions) {

                        console.log('Comparing ' + channel + ' and ' + liveSyncList[i].actions[repatch].to);
                        if (liveSyncList[i].actions[repatch].to == channel) {
                            liveSyncList[i].actions[repatch].turnOff = true;
                            console.log('Just set this item to turn off: ');
                            console.log(liveSyncList[i].actions[repatch]);
                        }
                    }

                }
            }

            if (index >= myCount - 1) {
                // last one needs to be turned off always
                for (repatch in liveSyncList[i].actions) {

                    console.log('Comparing last ' + channel + ' and ' + liveSyncList[i].actions[repatch].to);
                    if (liveSyncList[i].actions[repatch].to == channel) {

                        console.log('Just set LAST item to turn off: ' + channel);
                        console.log(liveSyncList[i].actions[repatch]);
                        liveSyncList[i].actions[repatch].turnOff = true;
                    }
                }
            }
            index++;
        }
    }
    console.log('Finished Hue race condition processing.');
    console.log(liveSyncList);
    var initHue = true;
    vid = VideoFrame({
        id: videoID,
        frameRate: 24,
        callback: function(response) {

            if (liveSyncList.length > 0 && vid.toMilliseconds(response) >= liveSyncList[0].time) {
                var sendList = [];
                for (i in liveSyncList[0].actions) {

                    liveSyncList[0].actions[i].command = "action";
                    liveSyncList[0].actions[i].senderAlias = myID;
                    if (liveSyncList[0].actions[i].actionID.toLowerCase().indexOf('hue ') == 0) {
                        liveSyncList[0].actions[i].command = 'sendHue';
                        liveSyncList[0].actions[i].target = liveSyncList[0].actions[i].to;
                        liveSyncList[0].actions[i].to = 'SERVER';
                        if (initHue) {
                            var body = {
                                "on": true
                            };
                        } else {
                            var body = {};
                        }
                        if (typeof liveSyncList[0].actions[i].dontTurnOn !== 'undefined' &&
                            liveSyncList[0].actions[i].dontTurnOn) {
                            console.log('Not turning on this Hue event');
                            delete body.on;
                        }
                        if (liveSyncList[0].actions[i].actionID == 'Hue colour') {
                            var rgb = hex2rgb(liveSyncList[0].actions[i].color);
                            var hsv = rgb2hsv(rgb.r, rgb.g, rgb.b);
                            body.hue = hsv[0];
                            body.sat = hsv[1];
                            body.bri = hsv[2];
                            body.transitiontime = liveSyncList[0].actions[i].fadeIn * 10
                        }

                        liveSyncList[0].actions[i].hueCommand = body;
                        // connection.send(JSON.stringify(liveSyncList[0].actions[i]));
                        sendList.push(liveSyncList[0].actions[i]);

                        if (typeof liveSyncList[0].actions[i].leaveOn !== 'undefined' &&
                            liveSyncList[0].actions[i].leaveOn) {
                            var myLeaveOn = true;
                        } else {
                            var myLeaveOn = false;
                        }
                        var hTarget = liveSyncList[0].actions[i].target;
                        var hFO = liveSyncList[0].actions[i].fadeOut;
                        var hSelf = [hTarget, hFO, myLeaveOn];
                        if (typeof liveSyncList[0].actions[i].turnOff !== 'undefined') {
                            window.setTimeout(function(mySelf) {

                                var bodyOff = {
                                    "on": false,
                                    "bri": 0,
                                    "transitiontime": mySelf[1] * 10
                                }
                                if (hSelf[2]) {
                                    console.log('Not turning on this Hue event');
                                    delete bodyOff.on;
                                    console.log(bodyOff);
                                }
                                var msg = {
                                    "command": "sendHue",
                                    "target": mySelf[0],
                                    "to": "SERVER",
                                    "senderAlias": myID,
                                    "hueCommand": bodyOff
                                }
                                console.log('Turning off frame sync-triggered hue action...');
                                console.log(msg);
                                connection.send(JSON.stringify(msg));

                            }.bind(this, hSelf), (liveSyncList[0].actions[i].duration - liveSyncList[0].actions[i].fadeOut) * 1000);
                        }

                    } else if (liveSyncList[0].actions[i].actionID.toLowerCase().indexOf('moodo') == 0) {
                        liveSyncList[0].actions[i].command = 'sendMoodo';
                        liveSyncList[0].actions[i].target = liveSyncList[0].actions[i].to;
                        liveSyncList[0].actions[i].to = 'SERVER';

                        var body = {
                            'slot0': liveSyncList[0].actions[i].moodoSlot0,
                            'slot1': liveSyncList[0].actions[i].moodoSlot1,
                            'slot2': liveSyncList[0].actions[i].moodoSlot2,
                            'slot3': liveSyncList[0].actions[i].moodoSlot3

                        };

                        liveSyncList[0].actions[i].moodoCommand = body;
                        // connection.send(JSON.stringify(liveSyncList[0].actions[i]));
                        sendList.push(liveSyncList[0].actions[i]);

                        var myTarget = liveSyncList[0].actions[i].target;

                        window.setTimeout(function(target) {

                            var bodyOff = {
                                'slot0': 0,
                                'slot1': 0,
                                'slot2': 0,
                                'slot3': 0

                            };
                            console.log('Turning off frame sync-triggered moodo action...');
                            console.log(msg);
                            var msg = {
                                "command": "sendMoodo",
                                "target": target,
                                "to": "SERVER",
                                "senderAlias": myID,
                                "moodoCommand": bodyOff
                            }
                            connection.send(JSON.stringify(msg));

                        }.bind(this, myTarget), (liveSyncList[0].actions[i].duration) * 1000);


                    } else {
                        // connection.send(JSON.stringify(liveSyncList[0].actions[i]));
                        if(myID == 'preview') {
                        	// send via test mode so that content reaches screens
                        	const a = liveSyncList[0].actions[i];
                        	sendTestAction(a, a.to, connection, a.duration);
                        } else {
                        	sendList.push(liveSyncList[0].actions[i]);
                        }

                    }
                }

                // send the stuff
                // console.log('Sending batch... ');
                // console.log(JSON.stringify(sendList));
                if(sendList.length) connection.send(JSON.stringify(sendList));

                // now remove this from the sync list
                liveSyncList.shift();
                if (liveSyncList.length == 0 && typeof vid !== 'undefined') {
                    vid.stopListen();
                    console.log('End of frame sync events for this video.');
                }
            } else {
                if (liveSyncList.length == 0 && typeof vid !== 'undefined') {
                    vid.stopListen();
                }
            }
        }
    });
    vid.listen('SMPTE');
    return vid;
}