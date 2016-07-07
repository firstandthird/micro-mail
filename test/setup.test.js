'use strict';
// configures a hapi server and test smtp server
// for unit testing outside of docker
const Rapptor = require('rapptor');
const SMTPServer = require('smtp-server').SMTPServer;

module.exports = (options, callback) => {
  const cwd = process.cwd();
  const rapptorOptions = { cwd };
  const port = options.port ? options.port : 8888;
  rapptorOptions.configPath = options.configPath ? options.configPath : `${cwd}/test/conf`;
  const rapptor = new Rapptor(rapptorOptions);
  rapptor.start((err, server) => {
    // set up a test smtp server:
    const smtpServer = new SMTPServer({
      // uncomment the next line to monitor SMTP exchange:
      // logger: true,
      disabledCommands: ['STARTTLS'],
      // auth method, for testing just needs to verify that
      // login info was passed correctly
      onAuth: (auth, session, callback2) => {
        return callback2(null, {
          user: auth.username,
          password: auth.password
        });
      },
      socketTimeout: 100 * 1000,
      closeTimeout: 6 * 1000,
      onData: (stream, session, callback2) => {
        stream.on('end', () => {
          return callback2(null, 'Message queued');
        });
        stream.on('data', () => {
        });
      },
    });
    smtpServer.listen(port, 'localhost');
    callback(server, smtpServer);
  });
};
