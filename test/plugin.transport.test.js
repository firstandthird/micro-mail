'use strict';
const tap = require('tap');
const Rapptor = require('rapptor');
const path = require('path');

let rapptor;
let server;
tap.beforeEach(async() => {
  rapptor = new Rapptor();
  await rapptor.start();
  server = rapptor.server;
  server.settings.app.views.path = path.join(__dirname, 'emails');
});

tap.afterEach(async() => {
  await rapptor.stop();
});

tap.test('plugin/transport - decorate', (assert) => {
  assert.equal(typeof server.transport, 'object');
  assert.equal(typeof server.transport.sendMail, 'function');
  assert.end();
});
