var express = require('express');
var router = express.Router();

/* Guest router, for audience interaction */
router.get(/.*/, function(req, res, next) {
  if(typeof project == 'undefined') {
      project = false;
  }  
  if(req.url.match(/ajax/)) {
    
    res.render('guestajax',{atmos:atmos,live: live,accumulator:req.query.accumulator,value:req.query.value,clientIP:req.ip});
  } else {
    res.render('guest', { title: 'Atmosphere OS Guest',live:live });
  }
  
}); 
module.exports = router;
