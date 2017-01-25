'use strict';
const test = require('tape');

const setup = require('./setup');
const fs = require('fs');
const path = require('path');

test('getEmailContent - with valid template', (assert) => {
  setup({}, (setupError, server, smtpServer) => {
    if (setupError) {
      throw setupError;
    }

    const data = {
      data: {
        firstName: 'bob',
        lastName: 'smith',
        serviceName: 'test city'
      }
    };
    const expectedOutput = fs.readFileSync(path.join(__dirname, 'expected', 'getEmailContent')).toString();
    server.settings.app.views.path = path.join(__dirname, 'emails', 'getEmailContent');
    server.methods.getEmailContent('getEmailContent', data, (err, content) => {
      assert.equal(err, null, 'no errors');
      assert.equal(content, expectedOutput, 'renders content correctly');
      server.stop(() => {
        smtpServer.close(assert.end);
      });
    });
  });
});

test('getEmailContent - with no template', (assert) => {
  setup({}, (setupError, server, smtpServer) => {
    if (setupError) {
      throw setupError;
    }
    const data = {
      toEmail: 'bob.smith@firstandthird.com',
      data: {
        firstName: 'bob',
        lastName: 'smith'
      }
    };
    server.methods.getEmailContent(undefined, data, (err, details) => {
      assert.equal(err, null, 'no errors');
      assert.equal(details, false);
      server.stop(() => {
        smtpServer.close(assert.end);
      });
    });
  });
});
