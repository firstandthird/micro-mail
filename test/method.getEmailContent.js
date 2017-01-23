const test = require('tape');

const setup = require('./setup.test');

setup({}, (setupError, server, smtpServer) => {
  if (setupError) {
    throw setupError;
  }
  test.onFinish(() => {
    server.stop();
    smtpServer.close();
  });

  test('getEmailContent - with valid template', (assert) => {
    const data = {
      template: 'getEmailDetails1',
      toEmail: 'bob.smith@firstandthird.com',
      data: {
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
      }
    };
    server.methods.getEmailContent(template, data, (err, content) => {
      assert.equal(err, null, 'no errors');
      console.log('+++');
      console.log('+++');
      console.log('+++');
      console.log('+++');
      console.log(content);
      assert.end();
    });
  });

  test('getEmailContent - with no template', (assert) => {
    const payload = {
      template: 'getEmailDetails2',
      toEmail: 'bob.smith@firstandthird.com',
      data: {
        firstName: 'bob',
        lastName: 'smith'
      }
    };
    server.methods.getEmailContent(payload, (err, details) => {
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
});
