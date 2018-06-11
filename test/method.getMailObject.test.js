'use strict';
const tap = require('tap');
const Rapptor = require('rapptor');
const path = require('path');

let rapptor;
let server;
tap.beforeEach(async () => {
  rapptor = new Rapptor();
  await rapptor.start();
  server = rapptor.server;
  server.settings.app.views.path = path.join(__dirname, 'emails');
});


tap.afterEach(async () => {
  await rapptor.stop();
});

tap.test('getMailObject ', async (assert) => {
  const details = {
    from: 'putin@kremlin.ru',
    fromName: 'crabbe',
    to: 'donald@whitehouse.gov',
    subject: 'that thing we discussed',
    text: 'we should do it next week they will never see it coming'
  };
  const content = 'do that thing we discussed last week';
  const result = await server.methods.getMailObject(details, content);
  assert.equal(typeof result, 'object', 'getMailObject result is object');
  assert.deepEqual(result, {
    to: details.to,
    from: '"crabbe" <putin@kremlin.ru>',
    subject: details.subject,
    html: content,
    text: details.text
  }, 'getMailObject result filled out correctly');
  assert.end();
});

tap.test('getMailObject will not validate if missing required fields', async (assert) => {
  const details = {
    fromName: 'crabbe',
    text: 'we should do it next week they will never see it coming'
  };
  const content = 'do that thing we discussed last week';
  try {
    await server.methods.getMailObject(details, content);
    assert.fail();
  } catch (err) {
    assert.equal(err.name, 'ValidationError', 'throws validation error');
    assert.end();
  }
});

tap.test('getMailObject --with headers ', async (assert) => {
  const details = {
    headers: {
      'the-secret-number': '206'
    },
    fromEmail: 'putin@kremlin.ru',
    fromName: 'crabbe',
    to: 'donald@whitehouse.gov',
    subject: 'that thing we discussed',
    text: 'we should do it next week they will never see it coming'
  };
  const content = 'do that thing we discussed last week';
  const result = await server.methods.getMailObject(details, content);
  assert.equal(result.headers['the-secret-number'], '206', 'passes headers');
  assert.end();
});
