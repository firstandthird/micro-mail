'use strict';
const test = require('./loadTests.js');

test('sendEmail - accepts valid submission and envelope', (assert, servers) => {
  const mailObj = {
    from: 'someone@somewhere.com',
    to: 'nobody@nowhere.com'
  };
  servers.server.methods.sendMail(mailObj, false, (err, result) => {
    assert.equal(err, null);
    assert.equal(typeof result, 'object', 'returns an object');
    assert.equal(result.accepted[0], 'nobody@nowhere.com', 'accepted result is correct');
    assert.equal(result.rejected.length, 0, 'was not rejected');
    assert.equal(result.response, '250 Message queued', 'response is 250');
    assert.deepEqual(result.envelope, { from: 'someone@somewhere.com', to: ['nobody@nowhere.com'] });
    assert.end();
  });
});

test('sendEmail - accepts valid submission', (assert, servers) => {
  const mailObj = {
    to: 'nobody@nowhere.com'
  };
  servers.server.methods.sendMail(mailObj, false, (err, result) => {
    assert.equal(err, null, 'does not error');
    assert.equal(typeof result, 'object', 'returns an object');
    assert.equal(result.accepted[0], 'nobody@nowhere.com', 'accepted result is correct');
    assert.equal(result.rejected.length, 0, 'was not rejected');
    assert.equal(result.response, '250 Message queued', 'response is 250');
    assert.end();
  });
});

test('sendEmail - accepts rejects invalid submission without destination', (assert, servers) => {
  const mailObj = {
    from: 'someone@somewhere.com'
  };
  servers.server.methods.sendMail(mailObj, false, (err, result) => {
    assert.notEqual(err, null, 'throws error if invalid destination');
    assert.end();
  });
});

test('should be able to send multiple destination emails at once as a comma-separated string', (assert, servers) => {
  const mailObj = {
    from: 'eagles@nest.com',
    to: 'prey@river.com, fish@lake.com',
    subject: 'What times are you available later?'
  };
  servers.server.methods.sendMail(mailObj, false, (err, result) => {
    assert.equal(err, null);
    assert.equal(result.accepted.length, 2, 'all emails accepted');
    assert.equal(result.response, '250 Message queued');
    assert.equal(result.envelope.to.length, 2, 'returns correctly-lengthed envelope');
    assert.end();
  });
});

test('should be able to send multiple destination emails at once as an array of strings', (assert, servers) => {
  const mailObj = {
    from: 'eagles@nest.com',
    to: ['prey@river.com', 'fish@lake.com'],
    subject: 'What times are you available later?',
  };
  servers.server.methods.sendMail(mailObj, false, (err, result) => {
    assert.equal(err, null);
    assert.equal(result.accepted.length, 2, '');
    assert.equal(result.response, '250 Message queued');
    assert.equal(result.envelope.to.length, 2);
    assert.end();
  });
});

test('will send separate emails to several destinations ', (assert, servers) => {
  const mailObj = {
    to: 'prey@river.com, vultures@largetree.com, crows@rock.com',
    from: 'emal@example.com',
    subject: 'This is a subject'
  };
  servers.server.methods.sendMail(mailObj, true, (err, result) => {
    assert.equal(err, null);
    assert.equal(result.length, 3);
    result.forEach((singleResult) => {
      assert.equal(singleResult.accepted.length, 1);
      assert.equal(singleResult.response, '250 Message queued');
      assert.equal(singleResult.envelope.to.length, 1);
    });
  });
});

test('will return if any email fails and list status for specific emails', (assert, servers) => {
  const mailObj = {
    to: 'prey@river.com, notanaddress, crows@rock.com',
    from: 'emal@example.com',
    subject: 'This is a subject'
  };
  servers.server.methods.sendMail(mailObj, true, (err, result) => {
    assert.equal(err, null, 'does not throw an error');
    assert.equal(result.length, 3);
    assert.equal(result[0].response, '250 Message queued');
    assert.equal(result[2].response, '250 Message queued');
    assert.equal(result[1].response, 'failed to send');
    assert.equal(result[1].rejected[0].to, 'notanaddress');
  });
});
