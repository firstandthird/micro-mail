const test = require('tape');
const setup = require('./setup.js');

test('getMailObject ', (assert) => {
  setup({}, (setupError, server, smtpServer) => {
    if (setupError) {
      throw setupError;
    }
    const details = {
      from: 'putin@kremlin.ru',
      fromName: 'crabbe',
      to: 'donald@whitehouse.gov',
      subject: 'that thing we discussed',
      text: 'we should do it next week they will never see it coming'
    };
    const content = 'do that thing we discussed last week';
    server.methods.getMailObject(details, content, (err, result) => {
      assert.equal(err, null);
      assert.equal(typeof result, 'object');
      assert.deepEqual(result, {
        to: details.to,
        from: '"crabbe" <putin@kremlin.ru>',
        subject: details.subject,
        html: content,
        text: details.text
      });
      server.stop(() => {
        smtpServer.close(assert.end);
      });
    });
  });
});

test('getMailObject will not validate if missing required fields', (assert) => {
  setup({}, (setupError, server, smtpServer) => {
    if (setupError) {
      throw setupError;
    }
    const details = {
      fromName: 'crabbe',
      text: 'we should do it next week they will never see it coming'
    };
    const content = 'do that thing we discussed last week';
    server.methods.getMailObject(details, content, (err, result) => {
      assert.notEqual(err, null);
      assert.equal(err.name, 'ValidationError');
      server.stop(() => {
        smtpServer.close(assert.end);
      });
    });
  });
});

test('getMailObject --with headers ', (assert) => {
  setup({}, (setupError, server, smtpServer) => {
    if (setupError) {
      throw setupError;
    }
    const details = {
      headers: {
        'the-secret-number': '206'
      },
      from: 'putin@kremlin.ru',
      fromName: 'crabbe',
      to: 'donald@whitehouse.gov',
      subject: 'that thing we discussed',
      text: 'we should do it next week they will never see it coming'
    };
    const content = 'do that thing we discussed last week';
    server.methods.getMailObject(details, content, (err, result) => {
      assert.equal(err, null);
      assert.equal(result.headers['the-secret-number'], '206');
      server.stop(() => {
        smtpServer.close(assert.end);
      });
    });
  });
});
