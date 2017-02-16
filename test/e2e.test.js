'use strict';
const test = require('./loadTests.js');

test('accepts one valid submission and envelope', (assert, servers) => {
  servers.server.inject({
    method: 'POST',
    url: '/send',
    payload: {
      fromEmail: 'flynn@gmail.com',
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

test('accepts multiple valid submissions and envelope', (assert, servers) => {
  servers.server.inject({
    method: 'POST',
    url: '/send',
    payload: {
      fromEmail: 'flynn@gmail.com',
      fromName: 'mikey',
      text: 'some text',
      to: 'totally_not_putin@absolutely_not_moscow.ru, absolutely_not_comey@fbi.gov',
      template: 'multipleTo',
      data: {
        firstName: 'general',
        lastName: 'mike',
        serviceName: 'tcp'
      }
    }
  }, (response) => {
    assert.equal(response.statusCode, 200, 'accepts valid multiple-to submission');
    assert.end();
  });
});
