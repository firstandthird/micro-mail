'use strict';
const test = require('./loadTests.js');

test('getEmailDetails - with yaml', (assert, servers) => {
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
      subject: 'Hi there bob test city',
      template: 'getEmailDetails2',
      fromName: 'Micro Mail',
      fromEmail: 'code@firstandthird.com',
      toName: 'bob smith',
      toEmail: 'bob.smith@firstandthird.com',
      pageDataSlug: 'micro-mail-templates',
      tag: 'template',
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
    template: 'no yaml',
    toEmail: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith'
    }
  };
  servers.server.methods.getEmailDetails(payload, (err, details) => {
    assert.equal(err, null, 'no errors');
    assert.deepEqual(details, {
      template: 'no yaml',
      toEmail: 'bob.smith@firstandthird.com',
      pageDataSlug: 'micro-mail-templates',
      tag: 'template',
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

test('getEmailDetails will not validate if data fields are blank', (assert, servers) => {
  const payload = {
    template: 'getEmailDetails2',
    toEmail: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith',
      theUnnamable: ''
    }
  };
  servers.server.methods.getEmailDetails(payload, (err, details) => {
    assert.notEqual(err, null);
  });
});

test('getEmailDetails - with pagedata )', (assert, servers) => {
  if (!servers.server.plugins['hapi-pagedata']) {
    return assert.end();
  }
  const payload = {
    template: 'getEmailDetails1',
    toEmail: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob'
    }
  };
  servers.server.methods.getEmailDetails(payload, (err, details) => {
    assert.equal(err, null, 'no errors');
    assert.deepEqual(details, {
      default1: 'yay default',
      subject: 'Hi there bob no absolutely not',
      fromName: 'Micro Mail',
      fromEmail: 'code@firstandthird.com',
      toName: 'bob yay default',
      toEmail: 'bob.smith@firstandthird.com',
      pageDataSlug: 'micro-mail-templates',
      template: 'getEmailDetails1',
      tag: 'template',
      data: {
        firstName: 'bob',
        lastName: 'yay default',
        serviceName: 'no absolutely not',
        temp: 'negative'
      },
    }, 'getEmailDetails sets up details correctly');
    assert.end();
  });
});
