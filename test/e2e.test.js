'use strict';
const tap = require('tap');
const Rapptor = require('rapptor');
const SMTPServer = require('smtp-server').SMTPServer;
const path = require('path');

let rapptor;
let server;
let smtpServer;
let lastMessage;
tap.beforeEach((done) => {
  rapptor = new Rapptor();
  lastMessage = '';
  const onData = (stream, session, callback) => {
    stream.on('end', () => callback(null, 'Message queued'));
    stream.on('data', (data) => {
      lastMessage += data.toString();
    });
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
    socketTimeout: 120 * 1000,
    closeTimeout: 60 * 1000,
    onData
  });
  smtpServer.listen(8888, 'localhost', (smtpErr) => {
    if (smtpErr) {
      return done(smtpErr);
    }
    rapptor.start((err, returned) => {
      if (err) {
        return done(err);
      }
      server = returned;
      server.settings.app.views.path = path.join(__dirname, 'emails');
      done();
    });
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
      text: 'some text {{data.firstName}}',
      subject: 'Heads up',
      data: {
        firstName: 'general',
        lastName: 'mike',
        serviceName: 'tcp'
      }
    }
  }, (response) => {
    assert.equal(response.statusCode, 200, 'accepts valid single submission');
    assert.notEqual(lastMessage.indexOf('Subject: Heads up'), -1);
    assert.notEqual(lastMessage.indexOf('some text general'), -1);
    assert.notEqual(lastMessage.indexOf('To: totally_not_putin@absolutely_not_moscow.ru'), -1);
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
    //TODO: better lastMessage tests
    assert.end();
  });
});
