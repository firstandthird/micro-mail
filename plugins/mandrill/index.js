'use strict';
const mandrill = require('mandrill-api/mandrill'); // eslint-disable-line import/no-unresolved
const send = require('./send');

exports.register = function(server, options, next) {
  const manClient = new mandrill.Mandrill(options.smtpPass);

  server.decorate('server', 'sendEmail', (data, done) => {
    send(server, manClient, data, done);
  });

  next();
};

exports.register.attributes = {
  name: 'mandrill'
};
