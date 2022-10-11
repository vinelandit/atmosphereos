function parseLogic(string,accumulators) {
  var result = /^(\S+)\s+(?i)if(?-i)\s+(\S+)\s+(\S+)\s+(\S+)\s+(?i)otherwise(?-i)\s+(\S)$/.exec(string);
  var subject = result[1];
  var operator = result[2];
  var condition = result[3];
  var value = result[4];
  var elseValue = result[5];

  var valid = true;

  if(accumulators.indexOf(subject)==-1) valid = false;

} 

if(typeof module !== 'undefined') {
	module.exports = {
		
		'parseLogic':parselogic
	}
}