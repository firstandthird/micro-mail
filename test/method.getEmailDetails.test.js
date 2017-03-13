'use strict';
const tap = require('tap');
const Rapptor = require('rapptor');
const path = require('path');

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

tap.test('getEmailDetails - with yaml', (assert) => {
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
    }, 'getEmailDetails sets up details correctly');
    assert.end();
  });
});

tap.test('getEmailDetails - with no yaml', (assert) => {
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
    }, 'getEmailDetails sets up details with no yaml');
    assert.end();
  });
});

tap.test('getEmailDetails will not validate if missing required fields', (assert) => {
  const payload = {
    template: 'getEmailDetails2',
    toEmail: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith',
      theUndefinable: undefined
    }
  };
  server.methods.getEmailDetails(payload, (err, details) => {
    assert.notEqual(err, null);
    assert.end();
  });
});

tap.test('getEmailDetails will not validate if data fields are blank', (assert) => {
  const payload = {
    template: 'getEmailDetails2',
    toEmail: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith',
      theUnnamable: ''
    }
  };
  server.methods.getEmailDetails(payload, (err, details) => {
    assert.notEqual(err, null);
    assert.end();
  });
});
