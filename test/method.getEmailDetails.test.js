'use strict';
const tap = require('tap');
const Rapptor = require('rapptor');
const path = require('path');
const async = require('async');

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
      subject: 'Hi there bob test city',
      template: 'getEmailDetails2',
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
    template: 'no yaml',
    toEmail: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith'
    }
  };
  server.methods.getEmailDetails(payload, (err, details) => {
    assert.equal(err, null, 'no errors');
    assert.deepEqual(details, {
      template: 'no yaml',
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

tap.test('getEmailDetails - with pagedata )', (assert) => {
  // mock pagedata route for testing, this needs to work with wreck.get:
  async.autoInject({
    pagedataServer(done) {
      const Hapi = require('hapi');
      const pagedataServer = new Hapi.Server();
      pagedataServer.connection({ port: 3000, host: 'localhost' });
      pagedataServer.route({
        path: '/api/sites/{site}/pages/{page}',
        method: 'GET',
        handler(request, reply) {
          assert.equal(request.params.site, 'site');
          assert.equal(request.params.page, 'slug');
          assert.equal(request.query.tag, 'tag');
          reply(null, {
            content: {
              subject: 'This is a subject to {{data.firstName}}',
              toName: '{{data.firstName}}'
            }
          });
        }
      });
      pagedataServer.start((err) => {
        if (err) {
          return done(err);
        }
        done(null, pagedataServer);
      });
    },
    getDetails(pagedataServer, done) {
      const payload = {
        template: 'getEmailDetailsPagedata',
        toEmail: 'bob.smith@firstandthird.com',
        data: {
          firstName: 'bob'
        }
      };
      server.methods.getEmailDetails(payload, (err, details) => {
        assert.equal(err, null, 'no errors');
        assert.deepEqual(details, {
          default1: 'yay default',
          template: 'getEmailDetailsPagedata',
          pagedata: {
            site: 'site',
            slug: 'slug',
            tag: 'tag'
          },
          subject: 'This is a subject to bob',
          toName: 'bob',
          toEmail: 'bob.smith@firstandthird.com',
          data: {
            firstName: 'bob'
          },
        }, 'getEmailDetails sets up details correctly');
        done();
      });
    },
    cleanup(getDetails, pagedataServer, done) {
      pagedataServer.stop(done);
    }
  }, (err) => {
    assert.equal(err, null, 'async no errors');
    assert.end();
  });
});
