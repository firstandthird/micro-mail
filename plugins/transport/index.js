'use strict';
const nodemailer = require('nodemailer');
const register = function(server, options) {
  if (!options.smtp || !options.smtp.host || !options.smtp.port) {
    throw new Error('must pass in smtp host and port');
  }
  const transportOptions = {
    host: options.smtp.host,
    port: options.smtp.port
  };
  if (options.smtp.user && options.smtp.pass) {
    transportOptions.auth = {
      user: options.smtp.user,
      pass: options.smtp.pass
    };
  }
  const transporter = nodemailer.createTransport(transportOptions);

  server.decorate('server', 'transport', transporter);
};

exports.plugin = {
  name: 'transport',
  once: true,
  pkg: require('../../package.json'),
  register
};
