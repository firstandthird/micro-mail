'use strict';
const async = require('async');

module.exports = function(mailObj, sendIndividual, allDone) {
  const server = this;
  if (!sendIndividual) {
    return server.transport.sendMail(mailObj, allDone);
  }
  // send one email per destination rather than all at once:
  // make sure it's an array:
  let destinations = [];
  if (Array.isArray(mailObj.to)) {
    destinations = mailObj.to;
  } else {
    destinations = mailObj.to.split(',');
  }
  async.map(destinations, (destination, done) => {
    const sendObj = Object.assign({}, mailObj, { to: destination.trim() });
    server.transport.sendMail(sendObj, (err, result) => {
      if (err) {
        return done(null, {
          response: 'failed to send',
          accepted: [],
          rejected: [sendObj]
        });
      }
      return done(null, result);
    });
  }, allDone);
};
