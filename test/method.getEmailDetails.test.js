const test = require('tape');

const setup = require('./setup');

setup({}, (setupError, server, smtpServer) => {
  if (setupError) {
    throw setupError;
  }
  test.onFinish(() => {
    server.stop(() => {
      smtpServer.close();
    });
  });


  test('getEmailDetails - with yaml', (assert) => {
    const payload = {
      template: 'getEmailDetails1',
      toEmail: 'bob.smith@firstandthird.com',
      data: {
        firstName: 'bob',
        lastName: 'smith'
      }
    };
    server.methods.getEmailDetails(payload, (err, details) => {
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

  test('getEmailDetails - with no yaml', (assert) => {
    const payload = {
      template: 'getEmailDetails2',
      toEmail: 'bob.smith@firstandthird.com',
      data: {
        firstName: 'bob',
        lastName: 'smith'
      }
    };
    server.methods.getEmailDetails(payload, (err, details) => {
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
