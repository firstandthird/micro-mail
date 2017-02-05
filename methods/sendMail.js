'use strict';
const async = require('async');

module.exports = function(mailObj, allDone) {
  const server = this;
  if (Array.isArray(mailObj)) {
    const results = [];
    async.each(mailObj, (mailItem, done) => {
      server.transport.sendMail(mailItem, (err, result) => {
        console.log(err)
        console.log(result)
        results.push(result);
        done(err);
      });
    }, (err) => {
      allDone(err, results);
    });
  } else {
    server.transport.sendMail(mailObj, allDone);
  }
};
