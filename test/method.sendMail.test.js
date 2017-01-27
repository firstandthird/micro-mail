'use strict';
const test = require('./loadTests.js');

test('plugin/transport - decorate', (assert, servers) => {
  const mailObj = {
    from: 'someone@somewhere.com',
    to: 'nobody@nowhere.com',
    smtp: {
      user: 'bae',
      pass: 'passw0rd',
      host: 'http://localhost',
      port: 8888
    }
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
