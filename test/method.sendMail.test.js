'use strict';
const test = require('./loadTests.js');

test('sendEmail - accepts valid submission and envelope', (assert, servers) => {
  const mailObj = {
    from: 'someone@somewhere.com',
    to: 'nobody@nowhere.com'
  };
  servers.server.methods.sendMail(mailObj, (err, result) => {
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
  servers.server.methods.sendMail(mailObj, (err, result) => {
    assert.equal(err, null);
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
  servers.server.methods.sendMail(mailObj, (err, result) => {
    assert.notEqual(err, null);
    assert.end();
  });
});
