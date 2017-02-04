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
    assert.equal(err, null, 'getEmailContent no errors');
    assert.equal(details, false, 'getEmailTemplate with no template, details is false');
    assert.end();
  });
});

test('should be able to inline css if specified', (assert, servers) => {
  const data = {
    inlineCss: true,
    text: '<style>div{color:red;}</style><div/>',
    color: 'red',
    data: {
      firstName: 'bob',
      lastName: 'smith',
      serviceName: 'test city',
      color: 'red'
    }
  };
  const expectedOutput = fs.readFileSync(path.join(__dirname, 'expected', 'test-template2.html')).toString();
  servers.server.methods.getEmailContent('test-template2', data, (err, content) => {
    assert.equal(err, null, 'getEmailContent no errors');
    assert.equal(content, expectedOutput, 'getEmailTemplate with no template, details is false');
    assert.end();
  });
});

// test('should be able to inline css if specified', (assert, servers) => {
//   const data = {
//     inlineCss: true,
//     color: 'red',
//     data: {
//       firstName: 'bob',
//       lastName: 'smith',
//       serviceName: 'test city',
//       color: 'red'
//     }
//   };
//   const expectedOutput = fs.readFileSync(path.join(__dirname, 'expected', 'getEmailContent.html')).toString();
//   servers.server.methods.getEmailContent('test-template2', data, (err, content) => {
//     assert.equal(err, null, 'getEmailContent no errors');
//     assert.equal(content, expectedOutput, 'getEmailTemplate with no template, details is false');
//     assert.end();
//   });
// });
