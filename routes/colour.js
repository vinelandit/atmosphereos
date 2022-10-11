var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('colour', { title: 'AtmosphereOS Colour Extractor'});
});

module.exports = router;
