'use strict';
const fs = require('fs');
const path = require('path');
const test = require('./loadTests.js');

test('getEmailContent - with valid template', (assert, servers) => {
  const data = {
    data: {
      firstName: 'bob',
      lastName: 'smith',
      serviceName: 'test city'
    }
  };
  const expectedOutput = fs.readFileSync(path.join(__dirname, 'expected', 'getEmailContent.html')).toString();
  servers.server.methods.getEmailContent('getEmailContent', data, (err, content) => {
    assert.equal(err, null, 'no errors');
    assert.equal(content, expectedOutput, 'renders content correctly');
    assert.end();
  });
});

test('getEmailContent - with no template', (assert, servers) => {
  const data = {
    toEmail: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith'
    }
  };
  servers.server.methods.getEmailContent(undefined, data, (err, details) => {
    assert.equal(err, null, 'no errors');
    assert.equal(details, false);
    assert.end();
  });
});
