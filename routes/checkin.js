var express = require('express');
var colour = require('../public/js/colourHelpers.js');
var router = express.Router();

const customScoreAttendee = {

  questions: {
	  	"Do you run with a VPN?" : 
	    {
	      "Yes": 2,
	      "No": 1,
	      "What's a VPN?": 0
	    },
	  "What browser do you use?" :
	    {
	      "Brave/Epic/Firefox/Tor": 2,
	      "Safari/Puffin/Freenet": 1,
	      "Chrome/Edge/Opera/I'm not sure": 0
	    },
	  "Cookies?" :
	    {
	      "No thanks/Only when necessary": 2,
	      "If it makes my life easier": 1,
	      "I don't know/Yum!": 0
	    },
	  "Bluetooth?" : 
	    {
	      "Only when necessary": 2,
	      "Always on": 1,
	      "What is Bluetooth? Is that you Harald?": 0
	    },
	  "Is your location turned on?" :
	    {
	      "Only when needed": 2,
	      "Always": 1,
	      "I don't know": 0
	    },
	  "What search engine do you use?" :
	    {
	      "Duck Duck Go": 2,
	      "Ecosia": 1,
	      "Google/Bing/I don't know": 0
	    }
	},

	evaluate: function(a) {
		var score = 0;
		if(a.answers) {
			for(var i in a.answers) {
				if(a.answers[i].question in this.questions) {
					const q = a.answers[i].question;
					const ans = a.answers[i].answer;
					console.log(q,ans,score);
					score += this.questions[q][ans]; 
				}
			}
			return score;
		} else {
			return -1;
		}

	},

	categorise: function(a) {
		const s = this.evaluate(a);
		if(s<=3) {
			return 'Data Thief';
		} else if(s>3 && s<=6) {
			return 'Everyday Ranger';
		} else {
			return 'Privacy Wizard';
		}
	}
}


function checkMatch(field,value,row,operator) {

	if(operator=='is') {
		return row[field].toLowerCase()==value.toLowerCase();
	} else if (operator=='isnot') {
		return row[field].toLowerCase()!=value.toLowerCase();
	} else if (operator=='contains') {
		return row[field].toLowerCase().indexOf(value.toLowerCase())>-1;
	} else if (operator=='doesnotcontain') {
		return row[field].toLowerCase().indexOf(value.toLowerCase())==-1;
	} else if (operator=='isatleast') {
		return parseFloat(row[field]) >= parseFloat(value);
	} else if (operator=='isatmost') {
		return parseFloat(row[field]) <= parseFloat(value);
	}

}

function triggerEvent(ce,row) {

	console.log('ce: ');
	console.log(ce);

	var target = ce.channel;
	var actionID = ce.actionID;
	var duration = ce.duration;

	if(typeof duration === 'undefined' || duration==null || duration=='' || duration==0) {
		duration = 1;
	}
  var fadeIn = ce.fadeIn;
  if(typeof fadeIn === 'undefined' || fadeIn==null || fadeIn=='') {
  	fadeIn = 0;
  }
  var fadeOut = ce.fadeOut;
  if(typeof fadeOut === 'undefined' || fadeOut==null || fadeOut=='') {
  	fadeOut = 0;
  }
	if(target.toLowerCase().indexOf('hue ')==0) {
		// hue event
		if(typeof hue !== null && typeof hue['devices']!== null && typeof hue['devices'][target]!=='undefined') {
          var id = hue['devices'][target].id;
          // hue action
          if(actionID=='Hue on') { 
            console.log('Triggering hue on on device '+target);
            hue.tellHue(id,{
              "on":true,
            });
          } else {
            console.log('Triggering hue colour on device '+target);
            var rgb = colour.hex2rgb(ce.color);
            if(rgb==null) {
              console.log('Invalid colour value '+ce.color);
            } else {
              var hsv = colour.rgb2hsv(rgb.r,rgb.g,rgb.b);
              var body = {
                "on":true,
                "hue":hsv[0],
                "sat":hsv[1],
                "bri":hsv[2],
                "transitiontime":fadeIn*10
              };
              console.log(body);
              hue.tellHue(id,body);
            }
          }
          // calculate duration
          
          console.log('duration: '+duration+'ms');
          setTimeout(function(){
            hue.tellHue(id,{
              "on":false,
              "bri":0,
              "transitiontime":fadeOut*10
            });
          },duration*1000);

        }
	} else {
		
	    if(typeof atmos.aliases[target] !== 'undefined') {

	      console.log('Triggering checkin action '+actionID+' on device '+target);
	      console.log('Duration: '+duration);
	      var c = atmos.clients[ atmos.aliases[target] ];
	      var response = {
	        "to":target,
	        "command":"action",
	        "actionID":actionID,
	        "duration":duration,
	        "fadeIn":fadeIn,
	        "fadeOut":fadeOut,
	        "mergeData":row
	    	};
	    	c.send(JSON.stringify(response));
	    }

	}
	   
}


/* checkin endpoint */
router.all('/', function(req, res, next) {
	var attendees = live.attendees;
	var ce = live.project.checkinEvents;
	// console.log('Attendees: ');
	// console.log(attendees);
	console.log(req.body);
	var result = '';
	var guest = {};
	
	if(!req.body.p) {
		req.body.p = '';
	}

	var p = req.body.p;
	if(!p) {
		p = req.query.p;
	}

	(async function() {
		
		if(p&&p.length>3) {
			const att = JSON.parse(await eb.validate(p));
			if(!att.error) {

				attendees[p] = att;
				live.accumulatorValues['ctChecked']++;
				live.accumulatorValues['ctRemaining']--;

				console.log('Evaluating custom score for attendee...');
				attendees[p].character = customScoreAttendee.categorise(attendees[p]);

				live.accumulatorValues.character = attendees[p].character;

				// get name
				var fn = 'Unnamed';
				for (var a in attendees[p].answers) {
					if(attendees[p].answers[a].question=='Please input your preferred player name for this experience') {
						fn = attendees[p].answers[a].answer;
						console.log('found name '+fn);
						break;
					}

				}
				live.updateAccumulatorValue('firstname', fn);
				live.updateAccumulatorValue('aid', attendees[p].id);

				// console.log(attendees[p]);

		    live.scanConditionals(); // check for any accumulator/checkin variable-specific conditional triggers


				// now search for matching checkin conditions
				for(i in ce) {
					if(ce[i].type=='match') {
						if(ce[i].condition.field=='' || checkMatch(ce[i].condition.field,ce[i].condition.value,attendees[p],ce[i].condition.operator)) {
							// trigger this event
							triggerEvent(ce[i],attendees[p]);
						}
					}
				}

				// send updated checkin stats to all screens
				// todo: only send to screens that need it
				for(var a in atmos.aliases) {
		        if(a!='MASTER') {
		          
		          var r = {
		            "to":a,
		            "command":"accumulator",
		            "name":'ctChecked',
		            "value":live.accumulatorValues['ctChecked']
		          }
		          myClientID = atmos.aliases[a];
		          atmos.clients[myClientID].send(JSON.stringify(r));
		          r = {
		            "to":a,
		            "command":"accumulator",
		            "name":'ctRemaining',
		            "value":live.accumulatorValues['ctRemaining']
		          }
		          atmos.clients[myClientID].send(JSON.stringify(r));
		        }
		    }

		    result = '<strong style="color:green">VALID</strong>';
		    attendees[p].isScanned = true;
		    guest = attendees[p].profile;
		    res.render('checkin', { code:p,result:result,guest:guest });
			} else {
				console.log('SPORK',ce);
				for(i in ce) {
					console.log('CHECKING BORK',ce[i]);
					if(ce[i].type=='error') {
						triggerEvent(ce[i]);
					}
				}
				if (res.headersSent) {
			    return next(err)
			  }

			  res.status(500)
			  res.render('error', { error: { 'error': 'bork', 'status':500}, message: '<strong style="color:red">INVALID</strong><br/><i>'+att.error+'</i>' })

			}


		}
		
		

		
	})();

	

	/* if(barcode.attendeeID) {
		eb.validate(barcode.attendeeID,handleAttendee);
	} */


	/*
	if(typeof attendees !== 'undefined' && typeof p !== 'undefined' && p>0 ) {
		p = 'o'+p;
		// try to match the number
		if(typeof attendees[p] !== 'undefined') {
			
			console.log('Found entry for '+p);
			if(typeof attendees[p].isScanned !== 'undefined' || attendees[p].isScanned) {
				// already scanned!

        result = '<strong style="color:red">ALREADY SCANNED</strong>';
				console.log(p+' has already been scanned!');
			} else {
				live.accumulatorValues['ctChecked']++;
				live.accumulatorValues['ctRemaining']--;

        live.scanConditionals(); // check for any accumulator/checkin variable-specific conditional triggers


				// now search for matching checkin conditions
				for(i in ce) {
					if(ce[i].type=='match') {
						if(ce[i].condition.field=='' || checkMatch(ce[i].condition.field,ce[i].condition.value,attendees[p],ce[i].condition.operator)) {
							// trigger this event
							triggerEvent(ce[i],attendees[p]);
						}
					}
				}

				// send updated checkin stats to all screens
				// todo: only send to screens that need it
				for(a in atmos.aliases) {
            if(a!='MASTER') {
              
              var r = {
                "to":a,
                "command":"accumulator",
                "name":'ctChecked',
                "value":live.accumulatorValues['ctChecked']
              }
              myClientID = atmos.aliases[a];
              atmos.clients[myClientID].sendUTF(JSON.stringify(r));
              r = {
                "to":a,
                "command":"accumulator",
                "name":'ctRemaining',
                "value":live.accumulatorValues['ctRemaining']
              }
              atmos.clients[myClientID].sendUTF(JSON.stringify(r));
            }
        }

        result = '<strong style="color:green">VALID</strong>';
        attendees[p].isScanned = true;
        guest = attendees[p];
			}
			
			
			
		} else {
			for(i in ce) {
				if(ce[i].type=='error') {
					triggerEvent(ce[i]);
				}
			}
			console.log('Could not find entry for '+p);
            result = '<strong style="color:red">INVALID</strong>';
		}
	} else {
		console.log('Error: missing information.');

        result = '<strong style="color:red">MISSING INFORMATION</strong>';
	} */


});

module.exports = router;
