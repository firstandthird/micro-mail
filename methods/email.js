'use strict';
const nodemailer = require('nodemailer');
const Logr = require('logr');
const log = new Logr({
  defaultTags: ['handler'],
  type: 'console'
});

let Transport = undefined;

const needsTransport = () => {
  return Transport === undefined;
};

const initTransport = (smtp) => {
  const key = `smtp://${smtp.user}:${smtp.pass}@${smtp.host}:${smtp.port}`;
  log(['email', 'send'], { message: 'initializing SMTP transport', key });
  Transport = nodemailer.createTransport(key);
};

module.exports = {
  method(mailObj, done) {
    if (needsTransport()) {
      // todo: get config from server if it's not there:
      const config = this.settings.app;
      initTransport(config.smtp);
    }
    log(['email', 'send'], { message: 'sending email now....', data: mailObj });
    Transport.sendMail(mailObj, done);
  }
};
