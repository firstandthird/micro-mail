const tap = require('tap');
const Rapptor = require('rapptor');
const SMTPServer = require('smtp-server').SMTPServer;
const path = require('path');

let rapptor;
let server;
let smtpServer;
let lastMessage;
tap.beforeEach(async () => {
  rapptor = new Rapptor({
    config: {
      templatePath: `${__dirname}`
    }
  });
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
  smtpServer.listen(8888, 'localhost');
  await rapptor.start();
  server = rapptor.server;
  server.settings.app.views.path = path.join(__dirname, 'emails');
});

tap.afterEach(async () => {
  await rapptor.stop();
});

tap.test('accepts one valid submission and envelope', async (assert) => {
  const response = await server.inject({
    method: 'POST',
    url: `/send?token=${process.env.MICROMAIL_API_KEY}`,
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
  });
  assert.equal(response.statusCode, 200, 'accepts valid single submission');
  assert.notEqual(lastMessage.indexOf('Subject: Heads up'), -1);
  assert.notEqual(lastMessage.indexOf('some text general'), -1);
  assert.notEqual(lastMessage.indexOf('To: totally_not_putin@absolutely_not_moscow.ru'), -1);
  await new Promise((resolve) => smtpServer.close(() => resolve()));
  assert.end();
});

tap.test('accepts multiple valid submissions and envelope', async (assert) => {
  const response = await server.inject({
    method: 'POST',
    url: `/send?token=${process.env.MICROMAIL_API_KEY}`,
    payload: {
      fromEmail: 'flynn@gmail.com',
      fromName: 'mikey',
      to: 'totally_not_putin@absolutely_not_moscow.ru, absolutely_not_comey@fbi.gov',
      template: 'multipleTo'
    }
  });
  assert.equal(response.statusCode, 200, 'accepts valid multiple-to submission');
  //TODO: better lastMessage tests
  await new Promise((resolve) => smtpServer.close(() => resolve()));
  assert.end();
});

tap.test('accepts headers as param', async (assert) => {
  const response = await server.inject({
    method: 'POST',
    url: `/send?token=${process.env.MICROMAIL_API_KEY}`,
    payload: {
      fromEmail: 'flynn@gmail.com',
      fromName: 'mikey',
      to: 'totally_not_putin@absolutely_not_moscow.ru, absolutely_not_comey@fbi.gov',
      template: 'multipleTo',
      headers: {
        'Reply-To': 'noone@example.dev'
      }
    }
  });
  assert.equal(response.statusCode, 200, 'accepts valid multiple-to submission');
  //TODO: better lastMessage tests
  await new Promise((resolve) => smtpServer.close(() => resolve()));
  assert.end();
});
