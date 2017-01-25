const nodemailer = require('nodemailer');
exports.register = function(server, options, next) {
  const transporter = nodemailer.createTransport({
    host: options.smtp.host,
    port: options.smtp.port,
    auth: {
      user: options.smtp.user,
      pass: options.smtp.pass
    }
  });

  server.decorate('server', 'transport', transporter);
  next();
};

exports.register.attributes = {
  name: 'transport'
};
