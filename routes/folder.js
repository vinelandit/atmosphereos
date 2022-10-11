var express = require('express');
var router = express.Router();
var fs = require('fs');
// List folder contents for front end AJAX calls

router.get('/:folderName',function(req,res) {
  if(req.params.folderName=='video'||req.params.folderName=='images'||req.params.folderName=='fonts'||req.params.folderName=='csv') {
    
    var path = __dirname+'/../public/'+req.params.folderName;

    fs.readdir(path, function(err, items) {
        var finalItems = [];
        for(i in items) {
          
            finalItems.push(items[i]);
            
        }

        res.send(JSON.stringify(finalItems));
    }); 
  } else {
    res.send('Invalid folder name: '+req.params.folderName);
  }
  
}); 
module.exports = router;
