'use strict';
const test = require('./loadTests.js');

test('accepts one valid submission and envelope', (assert, servers) => {
  servers.server.inject({
    method: 'POST',
    url: '/send',
    payload: {
      fromEmail: 'flynn@gmail.com',
      to: 'totally_not_putin@absolutely_not_moscow.ru',
      template: 'getEmailContent',
      subject: 'Heads up',
      data: {
        firstName: 'general',
        lastName: 'mike',
        serviceName: 'tcp'
      }
    }
  }, (response) => {
    console.log('==================');
    console.log(Object.keys(response));
    console.log(response.statusCode);
    console.log(response.result);
    assert.end();
  });
});
