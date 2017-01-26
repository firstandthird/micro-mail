'use strict';
const test = require('./loadTests.js');

test('plugin/transport - decorate', (assert, servers) => {
  assert.equal(typeof servers.server.transport, 'object');
  assert.equal(typeof servers.server.transport.sendMail, 'function');
});
