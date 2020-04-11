const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const HttpStatus = require('http-status-codes');
const fs = require('fs');

// create logs folder
if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs');
}
// config log4js
const log4js = require('log4js');
log4js.configure('./config/log4js.json');
const loggerApp = log4js.getLogger('app');

const app = express();
const corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  corsOptions = { origin: true, credentials: true }; // reflect (enable) the requested origin in the CORS response
  callback(null, corsOptions) // callback expects two parameters: error and options
};
app.use(cors(corsOptionsDelegate));
app.use(logger('dev'));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(cookieParser());
app.use('/api', require('./routes'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  const msg = err.message ? err.message : JSON.stringify(err);

  loggerApp.error('app::error ', err);
  console.error(msg);

  return res
    .status(HttpStatus.BAD_REQUEST)
    .json({
      messages: [msg]
    });
});

module.exports = app;
