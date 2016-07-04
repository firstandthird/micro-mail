'use strict';
// configures a hapi server and test smtp server
// for unit testing outside of docker
const Rapptor = require('rapptor');
const SMTPServer = require('smtp-server').SMTPServer;

module.exports = (options, callback) => {
  const cwd = process.cwd();
  const rapptor = new Rapptor({
    configPath: `${cwd}/test/conf`,
    cwd,
  });
  rapptor.start((err, server) => {
    // set up a test smtp server:
    const smtpServer = new SMTPServer({
      // uncomment to show SMTP exchange:
      // logger: true,
      disabledCommands: ['STARTTLS'],
      // auth method, for testing just needs to verify that
      // login info was passed correctly
      onAuth: (auth, session, callback) => {
        return callback(null, {
          user: auth.username,
          password: auth.password
        });
      },
      socketTimeout: 100 * 1000,
      closeTimeout: 6 * 1000,
      onData: (stream, session, callback) => {
        stream.on('end', () => {
          return callback(null, 'Message queued');
        });
        stream.on('data', (chunk) => {
        });
      },
    });
    smtpServer.listen(8888, 'localhost');
    callback(server, smtpServer);
  });
};
