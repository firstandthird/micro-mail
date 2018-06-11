'use strict';
const tap = require('tap');
const Rapptor = require('rapptor');
const path = require('path');
const fs = require('fs');

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

tap.test('getEmailContent - with valid template', async (assert) => {
  const data = {
    data: {
      firstName: 'bob',
      lastName: 'smith',
      serviceName: 'test city'
    }
  };
  const expectedOutput = fs.readFileSync(path.join(__dirname, 'expected', 'getEmailContent.html')).toString();
  const content = await server.methods.getEmailContent('getEmailContent', data);
  assert.equal(content, expectedOutput, 'renders content correctly');
  assert.end();
});

tap.test('getEmailContent - with no template', async (assert) => {
  const data = {
    toEmail: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith'
    }
  };
  const details = await server.methods.getEmailContent(undefined, data);
  assert.equal(details, false, 'getEmailTemplate with no template, details is false');
  assert.end();
});

tap.test('should be able to inline css if specified', async (assert) => {
  const data = {
    inlineCss: true,
    text: '<style>div{color:red;}</style><div/>',
    color: 'red',
    data: {
      firstName: 'bob',
      lastName: 'smith',
      serviceName: 'test city',
      color: 'red'
    }
  };
  const expectedOutput = fs.readFileSync(path.join(__dirname, 'expected', 'test-template2.html')).toString();
  const content = await server.methods.getEmailContent('test-template2', data);
  assert.equal(content, expectedOutput, 'able to inline css');
  assert.end();
});

tap.test('should also not inline if specified', async (assert) => {
  const data = {
    inlineCss: false,
    text: '<style>div{color:red;}</style><div/>',
    color: 'red',
    data: {
      firstName: 'bob',
      lastName: 'smith',
      serviceName: 'test city',
      color: 'red'
    }
  };
  const expectedOutput = fs.readFileSync(path.join(__dirname, 'expected', 'test-template3.html')).toString();
  const content = await server.methods.getEmailContent('test-template2', data);
  assert.equal(content, expectedOutput, 'will skip inlining css');
  assert.end();
});
