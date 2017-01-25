'use strict';
// configures a hapi server and test smtp server
// for unit testing outside of docker
const Rapptor = require('rapptor');
const SMTPServer = require('smtp-server').SMTPServer;

module.exports = (options, done) => {
  const rapptor = new Rapptor();

  const onData = options.onData ? options.onData : (stream, session, callback) => {
    stream.on('end', () => callback(null, 'Message queued'));
    stream.on('data', () => {});
  };

  rapptor.start((err, server) => {
    if (err) {
      return done(err);
    }
    // set up a test smtp server:
    const smtpServer = new SMTPServer({
      // uncomment to show SMTP exchange:
      // logger: true,
      disabledCommands: ['STARTTLS'],
      // auth method, for testing just needs to verify that
      // login info was passed correctly
      onAuth: (auth, session, callback) => callback(null, {
        user: auth.username,
        password: auth.password
      }),
      socketTimeout: 100 * 1000,
      closeTimeout: 6 * 1000,
      onData
    });
    smtpServer.listen(8888, 'localhost');
    done(null, server, smtpServer);
  });
};
