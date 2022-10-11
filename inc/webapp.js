
// EXPRESS WEB SERVER

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('../routes/index');
const checkinRouter = require('../routes/checkin');
const timelineRouter = require('../routes/timeline');
const folderRouter = require('../routes/folder');
const colourRouter = require('../routes/colour');
const ajaxRouter = require('../routes/ajax');
const screenRouter = require('../routes/screen');
const guestRouter = require('../routes/guest');
const qrRouter = require('../routes/qr');

const http = require('http');

const setup = function(webSocketsServerPort,expressPort){
  var app = express();

  // view engine setup
  app.set('views', path.join(__dirname, '../views'));
  app.set('view engine', 'ejs');

  // app.set('localIP',localIP);
  app.set('wsPort',webSocketsServerPort);
  app.set('httpPort',expressPort);
  app.set('port',expressPort);
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, '../public')));

  app.use('/', indexRouter);
  app.use('/timeline', timelineRouter);
  app.use('/ajax', ajaxRouter);
  app.use('/screen', screenRouter);
  app.use('/guest', guestRouter);
  app.use('/colour', colourRouter);
  app.use('/folder', folderRouter);
  app.use('/checkin', checkinRouter);
  app.use('/qr', qrRouter);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function(err, req, res, next) {

    console.log(err);
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  /* const server = app.listen(expressPort,"192.168.2.10",function(){
    console.log('Listening on all IPs')
  }); */
  return app;
};



if(typeof module !== 'undefined') {
  module.exports = {
    
    'setup':setup
    
  }
}