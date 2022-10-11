/* Websocket helper functions */
function sendHeartbeat(connection,alias) {
	var response = {
	  "to":"SERVER",
	  "senderAlias":alias,
	  "command":"heartbeat"
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