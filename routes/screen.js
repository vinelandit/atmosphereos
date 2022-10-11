var express = require('express');
var router = express.Router();

/* GET websocket test page page. */
/* router.get('/:alias', function(req, res, next) {
  if(req.params.alias == 'SCREEN1' || req.params.alias == 'SCREEN2' || req.params.alias == 'MOVIE') {
  	res.render('wstest', { title: 'WebSocket Test', alias: req.params.alias });
  }	else {
  	throw new Error('Alias not permitted. Only allowable local aliases are SCREEN1, SCREEN2 and MOVIE.');
  }
}); */
router.get(/.*/, function(req, res, next) {
  var aliasDataQR = "false";

  if(req.url.toLowerCase().indexOf('local')==1) {
  	var alias = req.url.toLowerCase().replace('/','');
    
    if(typeof atmos.screenTargets !== 'undefined') {
      
      for(var i in atmos.screenTargets) {

        if(atmos.screenTargets[i].id==alias) {
          
          if(atmos.screenTargets[i].qr) {
            aliasDataQR = "true";
          }
          break;
        }
      }
    } 
  } else
  	var alias = '';
  var aliasOptions = '';
  // console.log(atmos.screenTargets);
  // console.log(atmos.aliases);
  for(i in atmos.screenTargets) {
    // check if already in use
    var t = atmos.screenTargets[i].id;
    if(typeof atmos.aliases[t] === 'undefined' && t.toLowerCase().indexOf('local')!=0) {   
      aliasOptions += '<option data-qr="'+atmos.screenTargets[i].qr+'" value="'+t+'"';
      if(alias==t) aliasOptions += ' selected="selected" ';
      aliasOptions += '>'+t+'</option>'; 
    }
  }

  res.render('screen', { title: 'Atmosphere Media Screen',targets: atmos.screenTargets, aliasDataQR: aliasDataQR, alias: alias,aliasOptions : aliasOptions });
  
}); 
module.exports = router;
