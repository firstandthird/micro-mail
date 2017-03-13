'use strict';
const test = require('./loadTests.js');

test('accepts one valid submission and envelope', (assert, servers) => {
  servers.server.inject({
    method: 'POST',
    url: '/send',
    payload: {
      from: 'flynn@gmail.com',
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
  servers.server.route({
    path: '/api/sites/{site}/pages/{page}',
    method: 'GET',
    handler(request, reply) {
      reply({
        content: {
          data: {
            serviceName: 'no absolutely not',
            firstName: 'route',
            lastName: 'route route'
          }
        }
      });
    }
  });
  servers.server.inject({
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
    assert.end();
  });
});
