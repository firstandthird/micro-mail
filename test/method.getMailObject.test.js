'use strict';
const test = require('./loadTests.js');

test('getMailObject ', (assert, servers) => {
  const details = {
    from: 'putin@kremlin.ru',
    fromName: 'crabbe',
    to: 'donald@whitehouse.gov',
    subject: 'that thing we discussed',
    text: 'we should do it next week they will never see it coming'
  };
  const content = 'do that thing we discussed last week';
  servers.server.methods.getMailObject(details, content, (err, result) => {
    assert.equal(err, null);
    assert.equal(typeof result, 'object');
    assert.deepEqual(result, {
      to: details.to,
      from: '"crabbe" <putin@kremlin.ru>',
      subject: details.subject,
      html: content,
      text: details.text
    });
  });
});

test('getMailObject will not validate if missing required fields', (assert, servers) => {
  const details = {
    fromName: 'crabbe',
    text: 'we should do it next week they will never see it coming'
  };
  const content = 'do that thing we discussed last week';
  servers.server.methods.getMailObject(details, content, (err, result) => {
    assert.notEqual(err, null);
    assert.equal(err.name, 'ValidationError');
  });
});

test('getMailObject --with headers ', (assert, servers) => {
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
  servers.server.methods.getMailObject(details, content, (err, result) => {
    assert.equal(err, null);
    assert.equal(result.headers['the-secret-number'], '206');
  });
});
