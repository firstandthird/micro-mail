'use strict';
const async = require('async');

module.exports = function(mailObj, allDone) {
  const server = this;
  if (Array.isArray(mailObj)) {
    const results = [];
    async.each(mailObj, (mailItem, done) => {
      server.transport.sendMail(mailItem, (err, result) => {
        if (err) {
          results.push({
            response: 'failed to send',
            message: 'There has been an error',
            data: mailItem
          });
        } else {
          results.push(result);
        }
        return done();
      });
    }, (err) => {
      allDone(err, results);
    });
  } else {
    server.transport.sendMail(mailObj, allDone);
  }
};
