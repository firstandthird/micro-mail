const tap = require('tap');
const Rapptor = require('rapptor');
const SMTPServer = require('smtp-server').SMTPServer;
const path = require('path');

let rapptor;
let server;
let smtpServer;
tap.beforeEach(async () => {
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
  await smtpServer.listen(8888, 'localhost');
  await rapptor.start();
  server = rapptor.server;
  server.settings.app.views.path = path.join(__dirname, 'emails');
});

tap.afterEach(async () => {
  await rapptor.stop();
});

tap.test('sendEmail - accepts valid submission and envelope', async (assert) => {
  const mailObj = {
    from: 'someone@somewhere.com',
    to: 'nobody@nowhere.com',
    html: 'some html'
  };
  const result = await server.methods.sendMail(mailObj, false);
  assert.equal(typeof result, 'object', 'returns an object');
  assert.equal(result.accepted[0], 'nobody@nowhere.com', 'accepted result is correct');
  assert.equal(result.rejected.length, 0, 'was not rejected');
  assert.equal(result.response, '250 Message queued', 'response is 250');
  assert.deepEqual(result.envelope, { from: 'someone@somewhere.com', to: ['nobody@nowhere.com'] });
  await new Promise((resolve) => smtpServer.close(() => resolve()));
  assert.end();
});

tap.test('sendEmail - accepts valid submission', async (assert) => {
  const mailObj = {
    to: 'nobody@nowhere.com'
  };
  const result = await server.methods.sendMail(mailObj, false);
  assert.equal(typeof result, 'object', 'returns an object');
  assert.equal(result.accepted[0], 'nobody@nowhere.com', 'accepted result is correct');
  assert.equal(result.rejected.length, 0, 'was not rejected');
  assert.equal(result.response, '250 Message queued', 'response is 250');
  await new Promise((resolve) => smtpServer.close(() => resolve()));
  assert.end();
});

tap.test('sendEmail - accepts rejects invalid submission without destination', async (assert) => {
  const mailObj = {
    from: 'someone@somewhere.com'
  };
  try {
    await server.methods.sendMail(mailObj, false);
  } catch (err) {
    assert.notEqual(err, null, 'throws error if invalid destination');
    await new Promise((resolve) => smtpServer.close(() => resolve()));
    assert.end();
  }
});

tap.test('should be able to send multiple destination emails at once as a comma-separated string', async (assert) => {
  const mailObj = {
    from: 'eagles@nest.com',
    to: 'prey@river.com, fish@lake.com',
    subject: 'What times are you available later?'
  };
  const result = await server.methods.sendMail(mailObj, false);
  assert.equal(result.accepted.length, 2, 'all emails accepted');
  assert.equal(result.response, '250 Message queued');
  assert.equal(result.envelope.to.length, 2, 'returns correctly-lengthed envelope');
  await new Promise((resolve) => smtpServer.close(() => resolve()));
  assert.end();
});

tap.test('should be able to send multiple destination emails at once as an array of strings', async (assert) => {
  const mailObj = {
    from: 'eagles@nest.com',
    to: ['prey@river.com', 'fish@lake.com'],
    subject: 'What times are you available later?',
  };
  const result = await server.methods.sendMail(mailObj, false);
  assert.equal(result.accepted.length, 2, '');
  assert.equal(result.response, '250 Message queued');
  assert.equal(result.envelope.to.length, 2);
  await new Promise((resolve) => smtpServer.close(() => resolve()));
  assert.end();
});

tap.test('will send separate emails to several destinations ', async (assert) => {
  const mailObj = {
    to: 'prey@river.com, vultures@largetree.com, crows@rock.com',
    from: 'emal@example.com',
    subject: 'This is a subject'
  };
  const result = await server.methods.sendMail(mailObj, true);
  assert.equal(result.length, 3);
  result.forEach((singleResult) => {
    assert.equal(singleResult.accepted.length, 1);
    assert.equal(singleResult.response, '250 Message queued');
    assert.equal(singleResult.envelope.to.length, 1);
  });
  await new Promise((resolve) => smtpServer.close(() => resolve()));
  assert.end();
});

tap.test('will return if any email fails and list status for specific emails', async (assert) => {
  const mailObj = {
    to: 'prey@river.com, notanaddress, crows@rock.com',
    from: 'emal@example.com',
    subject: 'This is a subject'
  };
  const result = await server.methods.sendMail(mailObj, true);
  assert.equal(result.length, 3);
  assert.equal(result[0].response, '250 Message queued');
  assert.equal(result[2].response, '250 Message queued');
  assert.equal(result[1].response, 'failed to send');
  assert.equal(result[1].rejected[0].to, 'notanaddress');
  await new Promise((resolve) => smtpServer.close(() => resolve()));
  assert.end();
});
