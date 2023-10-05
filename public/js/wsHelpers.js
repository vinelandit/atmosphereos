/* Websocket helper functions */
String.prototype.deentitize = function() {
    var ret = this.replace(/&gt;/g, '>');
    ret = ret.replace(/&lt;/g, '<');
    ret = ret.replace(/&quot;/g, '"');
    ret = ret.replace(/&apos;/g, "'");
    ret = ret.replace(/&amp;/g, '&');
    return ret;
};
function flashAll(connection,alias) {
	var response = {
		"to":"SERVER",
		"command":"flash",
		"senderAlias":alias
	}
	connection.send(JSON.stringify(response));
}
function testAction(connection,destination,actionID,actionHTML,duration,fadeIn,fadeOut,fontFaces) {
	if(typeof fontFaces === 'undefined') {
		fontFaces = '';
	}
	var response = {
		"to":destination,
		"command":"testAction",
		"actionID":actionID,
		"actionHTML":actionHTML,
		"fontFaces":fontFaces,
		"duration":duration,
		"fadeIn":fadeIn,
		"fadeOut":fadeOut,
		"senderAlias":'MASTER'
	}
	connection.send(JSON.stringify(response));	
}
function flash(connection,destination,alias) {
	var response = {
		"to":destination,
		"command":"action",
		"actionID":"FLASH",
		"senderAlias":alias
	}
	connection.send(JSON.stringify(response));
}
function flashHueAll(connection,alias) {
	var response = {
		"to":"SERVER",
		"command":"flashHue",
		"target":'!all',
		"senderAlias":'MASTER'
	}
	connection.send(JSON.stringify(response));
}
function flashMoodoAll(connection,alias) {
	var response = {
		"to":"SERVER",
		"command":"flashMoodo",
		"target":'!all',
		"senderAlias":'MASTER'
	}
	connection.send(JSON.stringify(response));
}
function goLive(connection,fullData) {
	var response = {
		"to":"SERVER",
		"command":"goLive",
		"fullData":fullData,
		"senderAlias":'MASTER'
	}

    console.log(response);
	connection.send(JSON.stringify(response));	
}
function updateProject(connection,fullData) {
	var response = {
		"to":"SERVER",
		"command":"updateProject",
		"fullData":fullData,
		"senderAlias":'MASTER'
	}

    console.log(response);
	connection.send(JSON.stringify(response));	
}
function flashHue(connection,destination,alias) {
	var response = {
		"to":"SERVER",
		"command":"flashHue",
		"target":destination,
		"senderAlias":alias
	}
	connection.send(JSON.stringify(response));
}
function sendTargets(connection,alias,targets) {
	var response = {
	  "to":"SERVER",
	  "senderAlias":alias,
	  "command":"updateTargets",
	  "targets":targets
	}
	connection.send(JSON.stringify(response));
}
function sendHeartbeat(connection,alias,status,targets) {

	var response = {
	  "to":"SERVER",
	  "senderAlias":alias,
	  "command":"heartbeat",
	  "status":status
	}	
	connection.send(JSON.stringify(response));
}
function sendHue(connection,target,hueCommand) {
	if(typeof target === 'undefined') {
		var target = '!all';	
	}
	console.log(hueCommand);
	var response = {
	  "to":"SERVER",
	  "senderAlias":'MASTER',
	  "command":"sendHue",
	  "hueCommand":hueCommand,
	  "target":target
	}
	connection.send(JSON.stringify(response));
}
function haltLive(connection) {
	var response = {
	  "to":"SERVER",
	  "senderAlias":'MASTER',
	  "command":"haltLive"
	}
	connection.send(JSON.stringify(response));
}
function sendMoodo(connection,target,moodoCommand) {
	if(typeof target === 'undefined') {
		var target = '!all';	
	}
	console.log(moodoCommand);
	var response = {
	  "to":"SERVER",
	  "senderAlias":'MASTER',
	  "command":"sendMoodo",
	  "moodoCommand":moodoCommand,
	  "target":target
	}
	connection.send(JSON.stringify(response));
}
function requestManifest(connection,alias) {
	var response = {
	  "to":"SERVER",
	  "senderAlias":alias,
	  "command":"manifest"
	}
	connection.send(JSON.stringify(response));
}