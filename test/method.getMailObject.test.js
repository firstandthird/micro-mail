const test = require('tape');
const setup = require('./setup.js');

setup({}, (setupError, server, smtpServer) => {
  if (setupError) {
    throw setupError;
  }
  test.onFinish(() => {
    server.stop(() => {
      smtpServer.close();
    });
  });
  test('getMailObject ', (assert) => {
    const details = {
      from: 'putin@kremlin.ru',
      to: 'donald@whitehouse.gov',
      subject: 'that thing we discussed'
    };
    const content = 'do that thing we discussed last week';
    server.methods.getMailObject(details, content, (err, result) => {
      assert.equal(err, null);
      assert.equal(typeof result, 'object');
      assert.equal(result.to, details.to);
      assert.equal(result.from, details.from);
      assert.equal(result.subject, details.subject);
      assert.end();
    });
  });
});
