'use strict';
const tap = require('tap');
const Rapptor = require('rapptor');
const path = require('path');

let rapptor;
let server;
let smtpServer;
tap.beforeEach((done) => {
  rapptor = new Rapptor();
  const onData = (stream, session, callback) => {
    stream.on('end', () => callback(null, 'Message queued'));
    stream.on('data', () => {});
  };
  rapptor.start((err, returned) => {
    if (err) {
      return done(err);
    }
    server = returned;
    server.settings.app.views.path = path.join(__dirname, 'emails');
    done();
  });
});

tap.afterEach((done) => {
  rapptor.stop(() => {
    done();
  });
});

tap.test('getMailObject ', (assert) => {
  // console.log(Object.keys(assert))
  assert.done();
});
//   const details = {
//     from: 'putin@kremlin.ru',
//     fromName: 'crabbe',
//     to: 'donald@whitehouse.gov',
//     subject: 'that thing we discussed',
//     text: 'we should do it next week they will never see it coming'
//   };
//   const content = 'do that thing we discussed last week';
//   servers.server.methods.getMailObject(details, content, (err, result) => {
//     assert.equal(err, null, 'getMailObject works');
//     assert.equal(typeof result, 'object', 'getMailObject result is object');
//     assert.deepEqual(result, {
//       to: details.to,
//       from: '"crabbe" <putin@kremlin.ru>',
//       subject: details.subject,
//       html: content,
//       text: details.text
//     }, 'getMailObject result filled out correctly');
//     assert.end();
//   });
// });
//
// test('getMailObject will not validate if missing required fields', (assert, servers) => {
//   const details = {
//     fromName: 'crabbe',
//     text: 'we should do it next week they will never see it coming'
//   };
//   const content = 'do that thing we discussed last week';
//   servers.server.methods.getMailObject(details, content, (err, result) => {
//     assert.notEqual(err, null, 'getMailObject does not validate if missing fields');
//     assert.equal(err.name, 'ValidationError', 'throws validation error');
//     assert.end();
//   });
// });
//
// test('getMailObject --with headers ', (assert, servers) => {
//   const details = {
//     headers: {
//       'the-secret-number': '206'
//     },
//     fromEmail: 'putin@kremlin.ru',
//     fromName: 'crabbe',
//     to: 'donald@whitehouse.gov',
//     subject: 'that thing we discussed',
//     text: 'we should do it next week they will never see it coming'
//   };
//   const content = 'do that thing we discussed last week';
//   servers.server.methods.getMailObject(details, content, (err, result) => {
//     assert.equal(err, null, 'getMailObject with headers, no error');
//     assert.equal(result.headers['the-secret-number'], '206', 'passes headers');
//     assert.end();
//   });
// });
