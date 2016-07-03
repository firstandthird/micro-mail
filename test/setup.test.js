'use strict';
// configures a hapi server and test smtp server
// for unit testing outside of docker
const Rapptor = require('rapptor');
const SMTPServer = require('smtp-server').SMTPServer;
// const mockProcessHooks = (hooks, content, cb, cb2) => {
//   if (typeof cb === 'function') {
//     cb();
//   } else {
//     cb2();
//   }
// };

module.exports = (options, callback) => {
  const cwd = process.cwd();
  const rapptor = new Rapptor({
    configPath: `${cwd}/test/conf`,
    cwd,
  });
  rapptor.start((err, server) => {
    // set up a test smtp server:
    const smtpServer = new SMTPServer({
      secure: false,
      authOptional: true,
      allowInsecureAuth: true,
      logger: true,
      disabledCommands: ['STARTTLS'],
      // auth method, for testing just needs to verify that
      // login info was passed correctly
      onAuth: (auth, session, callback) => {
        return callback(null, {
          user: auth.username,
          password: auth.password
        });
      },
      onRcptTo: (address, session, callback) => {
        callback();
      },
      onMailFrom: (address, session, callback) => {
        callback();
      },
      socketTimeout: 100 * 1000,
      closeTimeout: 6 * 1000,
      onData: (stream, session, callback) => {
        // todo: maybe read some stuff here
        stream.on('end', () => {
          return callback(null, 'Message queued as abcdef');
        }.bind(this));
        stream.on('data', (chunk) => {
        })//.bind(this));
      },
    });
    server.on('error', function (err) {
        console.log('Error occurred===============');
        console.log(err);
    });
    smtpServer.listen(8888, 'localhost');
    callback(server, smtpServer);
  });
};
