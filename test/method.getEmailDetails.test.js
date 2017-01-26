'use strict';
const setup = require('./setup');
const tapeExtra = require('tape-extras');
const tape = require('tape');

const test = tapeExtra(tape, {
  before(done) {
    setup({}, (setupError, server, smtpServer) => {
      if (setupError) {
        throw setupError;
      }
      done(null, { server, smtpServer });
    });
  },
  after(servers, done) {
    servers.server.stop(() => {
      servers.smtpServer.close(() => {
        done();
      });
    });
  }
});

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
    });
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
    });
    assert.end();
  });
});
