const test = require('tape');

const setup = require('./setup.test');
const fs = require('fs');
const path = require('path');
setup({}, (setupError, server, smtpServer) => {
  if (setupError) {
    throw setupError;
  }
  test.onFinish(() => {
    server.stop(() => {
      smtpServer.close();
    });
  });

  test('getEmailContent - with valid template', (assert) => {
    const data = {
      data: {
        firstName: 'bob',
        lastName: 'smith',
        serviceName: 'test city'
      }
    };
    const template = fs.readFileSync(path.join(__dirname, 'templates', 'getEmailContent')).toString();
    const expectedOutput = fs.readFileSync(path.join(__dirname, 'expected', 'getEmailContent')).toString();
    server.methods.getEmailContent(template, data, (err, content) => {
      assert.equal(err, null, 'no errors');
      assert.equal(content, expectedOutput, 'renders content correctly');
      assert.end();
    });
  });

  test('getEmailContent - with no template', (assert) => {
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
      assert.end();
    });
  });
});
