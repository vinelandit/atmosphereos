// Main Atmosphere OS communications webserver object
const moment = require('../public/js/moment.min.js');
const http = require('http');
const url = require('url');

const atmos = {
  master: null,
  start(webSocketsServerPort) {

    var _this = this;
    // WEBSOCKET SERVER

    // websocket and http servers
    WebSocketServer = require('ws').Server;

    /**
     * Global variables
     */

    // list of currently connected clients (users)
    this.clients = [];
    this.aliases = [];
    this.lastClientListUpdate = Date.now();

    /**
     * HTTP server
     */
    this.server = http.createServer(function(request, response) {
      // Not important for us. We're writing WebSocket server,
      // not HTTP server
    });
    this.server.listen(webSocketsServerPort, function() {
      console.log((new Date()) + " WebSocket server is listening on port "
          + webSocketsServerPort);
    });

    /**
     * WebSocket server
     */
    this.wsServer = new WebSocketServer({
      // WebSocket server is tied to a HTTP server. WebSocket
      // request is just an enhanced HTTP request. For more info 
      // http://tools.ietf.org/html/rfc6455#page-6
      server: this.server,
      maxReceivedFrameSize: 1000000,
      maxReceivedMessageSize: 10000000
    });

    // This callback function is called every time someone
    // tries to connect to the WebSocket server
    this.wsServer.on('connection', function(connection, req) {

      // var connection = request.accept(null, request.origin); 

      connection.lastHeartbeat = Date.now();
      connection.screenStatus = 'active';

      console.log('NEW CONNECTION!');
      console.log(req.socket.remoteAddress);

      const wsu = new URL("http://dummy.com"+req.url);
      console.log('bollocks',wsu.searchParams);
      var alias = wsu.searchParams.get('alias');

      console.log('ALIAS: '+alias);

      if((req.socket.remoteAddress.indexOf('localhost')>-1||req.socket.remoteAddress=='::1') && typeof alias === 'undefined') {
          alias = 'MASTER';
      } else {
        if(typeof alias==='undefined' || alias=='') {
          // no unique ID supplied; set it temporarily to the next available number
          alias = 'ANONYMOUS';
        } else {
          // var alias = 'ANONYMOUS';
        }   
      }



      var myClientID = req.socket.remoteAddress;

      // special treatment for multiple clients on localhost
      // if(connection.remoteAddress.indexOf('localhost')>-1||connection.remoteAddress.indexOf('::1')==0||connection.remoteAddress.indexOf('127.0.0.1')>-1) {
      myClientID += ':'+alias;
      // }

      console.log((new Date()) + ' Connection from origin '
          + req.socket.remoteAddress + ': '+myClientID);
      // accept connection - you should check 'request.origin' to
      // make sure that client is connecting from your website
      // (http://en.wikipedia.org/wiki/Same_origin_policy)


      _this.clients[myClientID] = connection;
      _this.aliases[alias] = myClientID;

      if(alias=='MASTER') {
        _this.master = connection;
        hue.sendHueList();
        moodo.refresh();
      }

      _this.updateList();

      


      // user sent some message
      connection.on('message', function(message, isBinary) {
        message = isBinary ? message : message.toString();
       
        _this.handler(message, connection);
      });
      // user disconnected -- not used, implicit pong/keepalive used instead
      connection.on('close', function(connection) {
          
          console.log((new Date()) + " Peer "
              + connection.remoteAddress + " disconnected.");
          console.log(connection);
          // remove user from the list of connected clients
          delete _this.clients[connection.remoteAddress];
          if(_this.aliases.length>0) {
              for(var i in _this.aliases) {
              if(_this.aliases[i]==connection.remoteAddress) {
                delete _this.aliases[i];
                break;
              }
            }
          }

        
      });
    });

  },
  getAlias(clientID) {
    if(this.aliases.length>0) {
      for(var i in this.aliases) {
        if(this.aliases[i]==clientID) {
          return i;
        }
      }
      return '';
    } else return '';
  },
  handler(message,connection) {
    
      // log and broadcast the message

      var msg = message;
      
      // allow messages in the form of a single command object or an array of command objects
      var data = JSON.parse(msg);
      if(Array.isArray(data)) {
        bigData = data;
      } else {
        bigData = [data];
      }
      if(typeof bigData[0] === "object") {
        for(i in bigData) {
          data = bigData[i];
          // okay, check for required fields
          if(typeof data.to !== "undefined" && typeof data.command != "undefined") {
            var destination = data.to;
            if(typeof data.senderAlias !== "undefined") {
              var senderAlias = data.senderAlias;
              var senderID = this.aliases[senderAlias];
              var sender = this.clients[senderID];
            } else {
              var senderAlias = this.getAlias(connection.remoteAddress);
              var senderID = this.aliases[senderAlias];
              var sender = this.clients[senderID];
            }
            if(destination=='EVERYONE') {
              for(i in clients) {
                this.clients[i].send(JSON.stringify(data));
              }
            } else if (destination=='SERVER') {
              if(data.command=='mute'||data.command=='unmute') {
                if(data.command=='mute') {
                  live.mutedChannels[data.channel] = data.channel;
                } else {
                  delete live.mutedChannels[data.channel];
                }
                // console.log(live.mutedChannels);
              }

              if(data.command=='updateProject') {
                console.log('Received updated project data, storing...')
                live.project = data.fullData;
                eb.init(); // pass EventBrite info
              } else if(data.command=='flash') {
                for(a in this.aliases) {
                  if(a!='MASTER'&&a!='MOVIE') {

                    console.log('Flashing to '+a+' ('+this.aliases[a]+')');
                    var response = {
                      "to":a,
                      "command":"action",
                      "actionID":"FLASH",
                      "duration":5,
                      "fadeIn":0,
                      "fadeOut":0
                    }
                    myClientID = this.aliases[a];
                    this.clients[myClientID].send(JSON.stringify(response));
                  }
                }
              } else if(data.command=='flashHue') {
                if(hue!==null && typeof hue['devices']!=='undefined') {
                  
                  if(data.target=='!all') {
                      var hTargets = hue['devices'];
                  } else {
                      var hTargets = [ hue['devices'][data.target] ];
                  }

                  // console.log(hTargets);

                  for(i in hTargets) {
                    if(typeof hTargets[i]!=='undefined') {
                      hue.tellHue(hTargets[i].id,{
                        "on":true,
                        "bri": 254,
                        "hue": 0,
                        "sat": 254
                      });
                    }
                  }
                  var hueFlashWait = setTimeout(function(){

                    for(i in hTargets) {

                      if(typeof hTargets[i]!=='undefined') {
                       hue.tellHue(hTargets[i].id,{
                          "on":false,
                          "bri": 254,
                          "hue": 0,
                          "sat": 254
                        });
                      }
                    }              
                  },2000);
                }

              } else if (data.command=='sendHue') {
                  if(hue!==null&&typeof hue['devices']!=='undefined') {
                    
                    // check if local screen is sending command and channel is muted
                    if(data.senderAlias.indexOf('local')==0 && typeof live.mutedChannels[data.target] != 'undefined') {
                      // console.log('Ignoring hue video sync command because channel '+data.target+' is muted.');
                    } else {
                      if(data.target=='!all') {
                        var targets = hue['devices'];
                      } else {
                        var targets = [];
                        targets[0] = hue['devices'][data.target];
                      }
                      for(i in targets) {
                        if(typeof targets[i]!=='undefined') {
                          hue.tellHue(targets[i].id,data.hueCommand);
                        }
                      }                    
                    }

                    
                  }                

              } else if(data.command=='flashMoodo') {
                if(moodo!==null && typeof moodo['boxes']!=='undefined') {
                  
                  if(data.target=='!all') {
                      var mTargets = moodo['boxes'];
                  } else {
                      var mTargets = [ moodo['boxes'][data.target] ];
                  }

                  // console.log(mTargets);

                  for(i in mTargets) {
                    if(typeof mTargets[i]!=='undefined') {
                      moodo.tellMoodo(mTargets[i].name,{
                        'slot0':100,
                        'slot1':100,
                        'slot2':100,
                        'slot3':100
                      });
                    }
                  }
                  var moodoFlashWait = setTimeout(function(){

                    for(i in mTargets) {

                      if(typeof mTargets[i]!=='undefined') {
                       moodo.tellMoodo(mTargets[i].name,{
                          'slot0':0,
                          'slot1':0,
                          'slot2':0,
                          'slot3':0
                        });
                      }
                    }              
                  },5000);
                }

              } else if (data.command=='sendMoodo') {
                  if(moodo!==[]&&typeof moodo['boxes']!=='undefined') {
                    
                    
                    if(data.target=='!all') {
                      var targets = moodo['boxes'];
                    } else {
                      var targets = [];
                      targets[0] = moodo['boxes'][data.target];
                    }
                    for(i in targets) {
                      if(typeof targets[i]!=='undefined') {
                        moodo.tellMoodo(data.target,data.moodoCommand);
                      }
                    }                    
                    
                    
                  }                

              } else if (data.command=='updateTargets') {
                  if(typeof data.targets !== 'undefined') {
                    this.screenTargets = data.targets;
                    // console.log('Updated targets:');
                    // console.log(this.screenTargets);
                  }            

              } else if (data.command=='heartbeat') {
                
                myClientID = connection.remoteAddress;
                if(typeof data.targets !== 'undefined') {
                  targets = data.targets;
                }  
                if(typeof sender !== 'undefined') {
                  sender.lastHeartbeat = Date.now();

                  var change = false;
                  if(sender.screenStatus!=data.status) {
                    change = true;
                  }
                  sender.screenStatus = data.status;



                  if(change) this.updateList();

                  if(Date.now()-this.lastClientListUpdate > 5000) {
                    // update client list
                    var updateNow = false;
                    for(i in this.aliases) {
                      var clientID = this.aliases[i];
                      if(typeof this.clients[clientID] !== 'undefined') {
                        if(Date.now()-this.clients[clientID].lastHeartbeat > 20000) {
                          // stale connection, remove from list
                          delete this.clients[clientID];
                          delete this.aliases[i];
                          console.log('removed stale user '+i);
                          updateNow = true;

                        }
                      }
                      
                    }
                    if(updateNow) {
                        this.updateList();
                    }
                  }

                  // console.log(senderAlias+' ('+senderID+') lastHeartbeat: '+sender.lastHeartbeat+', status: '+sender.screenStatus);
                }
                  
                 
                  

                  
              } else if (data.command=='change_alias') {
                // client has requested change of alias
                // first check if it's free
                var me = connection.remoteAddress;
                var new_alias = data.new_alias;

                if(typeof this.aliases[new_alias] === 'undefined' && new_alias!='MOVIE' && new_alias!='SCREEN1' && new_alias!='SCREEN2') {
                  
                  // now delete the old one
                  // if(aliases.length>0) {

                  for(var i in this.aliases) {
                      if(this.aliases[i]==connection.remoteAddress) {
                          delete this.aliases[i];
                          
                      }
                    }
                  // }                
                  // okay, new alias is free, change
                  this.aliases[new_alias] = connection.remoteAddress;


                  this.updateList();
                  // send confirmation message
                  var response = {
                    "senderAlias" : "SERVER",
                    "to" : new_alias,
                    "command" : "new_alias_result",
                    "result" : "SUCCESS",
                    "info" : "New ID is "+new_alias
                  };
                  connection.send(JSON.stringify(response));
                } else {

                  var response = {
                    "senderAlias" : "SERVER",
                    "to" : senderAlias,
                    "command" : "new_alias_response",
                    "result" : "FAILURE",
                    "info" : "ID "+new_alias+" is already in use"
                  };
                  connection.send(JSON.stringify(response));
                }
              } else if (data.command=='manifest') {  
                var manifest = [];
                for(i in aliases) {
                  manifest.push(i);
                }
                var response = {
                  "senderAlias" : "SERVER",
                  "to" : senderAlias,
                  "command" : "manifest_response",
                  "manifest" : manifest
                }
                sender.send(JSON.stringify(response));
              } else if (data.command=='goLive') {
                 console.log('Received go live');
                 if(typeof data.fullData !== 'undefined') {
                  live.project = data.fullData;
                  live.goLive();
                 }   

              } else if (data.command=='haltLive') {
                console.log('Exiting live mode');
                live.haltLive();
              }
            } else {
              // console.log('SPECIFIC DESTINATION '+destination);
              // okay, try to find the destination
              var myClientID = this.aliases[destination];
              if(typeof myClientID !== "undefined") {
                // console.log('Checking sender '+data.senderAlias+' to channel '+destination);
                // check if local screen is sending command and channel is muted
                if(data.senderAlias.indexOf('local')==0 && typeof live.mutedChannels[destination] !== 'undefined') {
                  // console.log('Ignoring video sync command because channel '+destination+' is muted.');
                } else {
                  var myClient = this.clients[ myClientID ];
                  if(typeof myClient !== "undefined") {
                    // send message
                    // console.log('SENDING TO '+destination);
                    // console.log(data);
                    myClient.send(JSON.stringify(data));
                  }
                }
              }
            

            }
            
          }
        }
        
      }


          

        
      
  },




  updateList() {
    console.log('UPDATING LIST...');
    if(this.master!==null) {
      var manifest = [];
        for(i in this.aliases) {
          var a = this.aliases[i];
          var c = this.clients[a];
          if(typeof c !== 'undefined') {
            var temp = {
              'alias':i,
              'status':c.screenStatus
            }
            manifest.push(temp);

          }
        }
        var response = {
          "senderAlias" : "SERVER",
          "to" : 'MASTER',
          "command" : "manifest_response",
          "manifest" : manifest
        }
        this.master.send(JSON.stringify(response));
      // console.log('Sending manifest to MASTER');
      // console.log(manifest);
    }
    
  }







};




if(typeof module !== 'undefined') {
  module.exports = {
    
    'atmos':atmos
    
  }
}