'use strict';
const tap = require('tap');
const Rapptor = require('rapptor');
const path = require('path');
const fs = require('fs');

let rapptor;
let server;
tap.beforeEach((done) => {
  rapptor = new Rapptor();
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

tap.test('getEmailContent - with valid template', (assert) => {
  const data = {
    data: {
      firstName: 'bob',
      lastName: 'smith',
      serviceName: 'test city'
    }
  };
  const expectedOutput = fs.readFileSync(path.join(__dirname, 'expected', 'getEmailContent.html')).toString();
  server.methods.getEmailContent('getEmailContent', data, (err, content) => {
    assert.equal(err, null, 'no errors');
    assert.equal(content, expectedOutput, 'renders content correctly');
    assert.end();
  });
});

tap.test('getEmailContent - with no template', (assert) => {
  const data = {
    toEmail: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith'
    }
  };
  server.methods.getEmailContent(undefined, data, (err, details) => {
    assert.equal(err, null, 'getEmailContent no errors');
    assert.equal(details, false, 'getEmailTemplate with no template, details is false');
    assert.end();
  });
});

tap.test('should be able to inline css if specified', (assert) => {
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
  server.methods.getEmailContent('test-template2', data, (err, content) => {
    assert.equal(err, null, 'getEmailContent no errors');
    assert.equal(content, expectedOutput, 'able to inline css');
    assert.end();
  });
});

tap.test('should also not inline if specified', (assert) => {
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
  server.methods.getEmailContent('test-template2', data, (err, content) => {
    assert.equal(err, null, 'getEmailContent no errors');
    assert.equal(content, expectedOutput, 'will skip inlining css');
    assert.end();
  });
});
