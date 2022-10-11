var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('timeline', { title: 'AtmosphereOS Timeline', localIP: res.app.get('localIP'), goLiveIn: req.query.goLiveIn, projectID: req.query.projectID });
});

module.exports = router;