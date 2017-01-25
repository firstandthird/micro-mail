'use strict';
const test = require('tape');
const setup = require('./setup');

test('plugin/transport - decorate', (assert) => {
  setup({}, (setupError, server, smtpServer) => {
    if (setupError) {
      throw setupError;
    }

    assert.equal(typeof server.transport, 'object');
    assert.equal(typeof server.transport.sendMail, 'function');
    server.stop(() => {
      smtpServer.close(assert.end);
    });
  });
});
