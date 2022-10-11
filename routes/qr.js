var express = require('express');
var router = express.Router();
var QRCode = require('qrcode');


/* Guest router, for audience interaction */
router.get('/:mode?/', function(req, res, next) {
  
  if(req.params.mode=='checkin') {
    var url = 'http://'+mapIP.localIP+":"+mapIP.expressPort+"/checkin?p=";
    mymode = 'Atmosphere Check-in root URL';
  } else if (req.params.mode=='arb') {
    // arbitrary URL base64 encoded
    var url = decodeURIComponent(req.query.u);
    
    mymode = '';
  } else {
    var url = 'http://'+mapIP.localIP+":"+mapIP.expressPort+"/screen";
    mymode = 'Atmosphere Guest Access';
  }

  
  var getCode = QRCode.toString(url, { 'type':'svg', 'margin': 1 }, function(err,string) {
    res.render('qr',{url: url,svgString:string, mode:mymode});
  });

 
}); 
module.exports = router;
