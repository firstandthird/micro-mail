'use strict';
const tap = require('tap');
const Rapptor = require('rapptor');
const SMTPServer = require('smtp-server').SMTPServer;
const path = require('path');

let rapptor;
let server;
let smtpServer;
tap.beforeEach((done) => {
  rapptor = new Rapptor();
  const onData = (stream, session, callback) => {
    stream.on('end', () => callback(null, 'Message queued'));
    stream.on('data', () => {});
  };
  // set up a test smtp server:
  smtpServer = new SMTPServer({
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
  rapptor.start((err, returned) => {
    if (err) {
      return done(err);
    }
    server = returned;
    server.settings.app.views.path = path.join(__dirname, 'emails');
    done();
  });
});

tap.afterEach((done) => {
  rapptor.stop(() => {
    smtpServer.close(() => {
      done();
    });
  });
});

tap.test('accepts one valid submission and envelope', (assert) => {
  server.inject({
    method: 'POST',
    url: '/send',
    payload: {
      from: 'flynn@gmail.com',
      fromName: 'mikey',
      to: 'totally_not_putin@absolutely_not_moscow.ru',
      text: 'some text',
      subject: 'Heads up',
      data: {
        firstName: 'general',
        lastName: 'mike',
        serviceName: 'tcp'
      }
    }
  }, (response) => {
    assert.equal(response.statusCode, 200, 'accepts valid single submission');
    assert.end();
  });
});

tap.test('accepts multiple valid submissions and envelope', (assert) => {
  server.inject({
    method: 'POST',
    url: '/send',
    payload: {
      fromEmail: 'flynn@gmail.com',
      fromName: 'mikey',
      to: 'totally_not_putin@absolutely_not_moscow.ru, absolutely_not_comey@fbi.gov',
      template: 'multipleTo'
    }
  }, (response) => {
    assert.equal(response.statusCode, 200, 'accepts valid multiple-to submission');
    assert.end();
  });
});
