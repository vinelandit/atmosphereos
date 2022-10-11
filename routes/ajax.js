var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	// unpack json 
	var data = req.query.data;
	data = JSON.parse(data);
	var out = '';
	for(i in data) {
		out = out + i + ': '+data[i]+'<br/>';
	}
  res.send(out);
});

module.exports = router;