const config = require('config');
const mongoConfig = config.get('mongo');
const mongoose = require('mongoose');
const log4js = require('log4js');
const logger = log4js.getLogger('app');

module.exports = (callback) => {
  mongoose.connect(mongoConfig.uri, { useNewUrlParser: true }, async function (err) {
    if (err) {
      logger.error("app::Connection DB::Can't connection DB");
      throw new Error(err);
    } else {
      callback();
    }
  });
};
