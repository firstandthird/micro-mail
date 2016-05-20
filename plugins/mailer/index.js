const nodemailer = require('nodemailer');
const send = require('./send');
exports.register = function(server, options, next) {
  const transporter = nodemailer.createTransport({
    host: options.smtp.host,
    port: options.smtp.port,
    auth: {
      user: options.smtp.user,
      pass: options.smtp.pass
    }
  });

  server.decorate('server', 'sendEmail', (data, done) => {
    send(server, transporter, data, done);
  });

  next();
};

exports.register.attributes = {
  name: 'mailer'
};