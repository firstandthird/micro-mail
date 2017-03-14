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

tap.test('sendEmail - accepts valid submission and envelope', (assert) => {
  const mailObj = {
    from: 'someone@somewhere.com',
    to: 'nobody@nowhere.com',
    html: 'some html'
  };
  server.methods.sendMail(mailObj, false, (err, result) => {
    assert.equal(err, null);
    assert.equal(typeof result, 'object', 'returns an object');
    assert.equal(result.accepted[0], 'nobody@nowhere.com', 'accepted result is correct');
    assert.equal(result.rejected.length, 0, 'was not rejected');
    assert.equal(result.response, '250 Message queued', 'response is 250');
    assert.deepEqual(result.envelope, { from: 'someone@somewhere.com', to: ['nobody@nowhere.com'] });
    assert.end();
  });
});

tap.test('sendEmail - accepts valid submission', (assert) => {
  const mailObj = {
    to: 'nobody@nowhere.com'
  };
  server.methods.sendMail(mailObj, false, (err, result) => {
    assert.equal(err, null, 'does not error');
    assert.equal(typeof result, 'object', 'returns an object');
    assert.equal(result.accepted[0], 'nobody@nowhere.com', 'accepted result is correct');
    assert.equal(result.rejected.length, 0, 'was not rejected');
    assert.equal(result.response, '250 Message queued', 'response is 250');
    assert.end();
  });
});

tap.test('sendEmail - accepts rejects invalid submission without destination', (assert) => {
  const mailObj = {
    from: 'someone@somewhere.com'
  };
  server.methods.sendMail(mailObj, false, (err, result) => {
    assert.notEqual(err, null, 'throws error if invalid destination');
    assert.end();
  });
});

tap.test('should be able to send multiple destination emails at once as a comma-separated string', (assert) => {
  const mailObj = {
    from: 'eagles@nest.com',
    to: 'prey@river.com, fish@lake.com',
    subject: 'What times are you available later?'
  };
  server.methods.sendMail(mailObj, false, (err, result) => {
    assert.equal(err, null);
    assert.equal(result.accepted.length, 2, 'all emails accepted');
    assert.equal(result.response, '250 Message queued');
    assert.equal(result.envelope.to.length, 2, 'returns correctly-lengthed envelope');
    assert.end();
  });
});

tap.test('should be able to send multiple destination emails at once as an array of strings', (assert) => {
  const mailObj = {
    from: 'eagles@nest.com',
    to: ['prey@river.com', 'fish@lake.com'],
    subject: 'What times are you available later?',
  };
  server.methods.sendMail(mailObj, false, (err, result) => {
    assert.equal(err, null);
    assert.equal(result.accepted.length, 2, '');
    assert.equal(result.response, '250 Message queued');
    assert.equal(result.envelope.to.length, 2);
    assert.end();
  });
});

tap.test('will send separate emails to several destinations ', (assert) => {
  const mailObj = {
    to: 'prey@river.com, vultures@largetree.com, crows@rock.com',
    from: 'emal@example.com',
    subject: 'This is a subject'
  };
  server.methods.sendMail(mailObj, true, (err, result) => {
    assert.equal(err, null);
    assert.equal(result.length, 3);
    result.forEach((singleResult) => {
      assert.equal(singleResult.accepted.length, 1);
      assert.equal(singleResult.response, '250 Message queued');
      assert.equal(singleResult.envelope.to.length, 1);
    });
    assert.end();
  });
});

tap.test('will return if any email fails and list status for specific emails', (assert) => {
  const mailObj = {
    to: 'prey@river.com, notanaddress, crows@rock.com',
    from: 'emal@example.com',
    subject: 'This is a subject'
  };
  server.methods.sendMail(mailObj, true, (err, result) => {
    assert.equal(err, null, 'does not throw an error');
    assert.equal(result.length, 3);
    assert.equal(result[0].response, '250 Message queued');
    assert.equal(result[2].response, '250 Message queued');
    assert.equal(result[1].response, 'failed to send');
    assert.equal(result[1].rejected[0].to, 'notanaddress');
    assert.end();
  });
});
