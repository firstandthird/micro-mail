'use strict';
const test = require('./loadTests.js');

test('getEmailDetails - with yaml', (assert, servers) => {
  const payload = {
    template: 'getEmailDetails1',
    toEmail: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith'
    }
  };
  servers.server.methods.getEmailDetails(payload, (err, details) => {
    assert.equal(err, null, 'no errors');
    assert.deepEqual(details, {
      subject: 'Hi there bob test city',
      template: 'getEmailDetails1',
      fromName: 'Micro Mail',
      fromEmail: 'code@firstandthird.com',
      toName: 'bob smith',
      toEmail: 'bob.smith@firstandthird.com',
      data: {
        firstName: 'bob',
        lastName: 'smith',
        serviceName: 'test city'
      },
      default1: 'yay default'
    }, 'getEmailDetails sets up details correctly');
    assert.end();
  });
});

test('getEmailDetails - with no yaml', (assert, servers) => {
  const payload = {
    template: 'getEmailDetails2',
    toEmail: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith'
    }
  };
  servers.server.methods.getEmailDetails(payload, (err, details) => {
    assert.equal(err, null, 'no errors');
    assert.deepEqual(details, {
      template: 'getEmailDetails2',
      toEmail: 'bob.smith@firstandthird.com',
      data: {
        firstName: 'bob',
        lastName: 'smith'
      },
      default1: 'yay default'
    }, 'getEmailDetails sets up details with no yaml');
    assert.end();
  });
});

test('getEmailDetails will not validate if missing required fields', (assert, servers) => {
  const payload = {
    template: 'getEmailDetails2',
    toEmail: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith',
      theUndefinable: undefined
    }
  };
  servers.server.methods.getEmailDetails(payload, (err, details) => {
    assert.notEqual(err, null);
  });
});
