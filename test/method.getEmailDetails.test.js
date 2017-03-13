'use strict';
const test = require('./loadTests.js');
const async = require('async');

test('getEmailDetails - with yaml', (assert, servers) => {
  const payload = {
    template: 'getEmailDetails2',
    toEmail: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith'
    }
  };
  servers.server.methods.getEmailDetails(payload, (err, details) => {
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

test('getEmailDetails - with no yaml', (assert, servers) => {
  const payload = {
    template: 'no yaml',
    toEmail: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith'
    }
  };
  servers.server.methods.getEmailDetails(payload, (err, details) => {
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

test('getEmailDetails will not validate if missing required fields', (assert, servers) => {
  const payload = {
    template: 'getEmailDetails2',
    toEmail: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith',
      theUndefinable: undefined
    }
  };
  servers.server.methods.getEmailDetails(payload, (err, details) => {
    assert.notEqual(err, null);
    assert.end();
  });
});

test('getEmailDetails will not validate if data fields are blank', (assert, servers) => {
  const payload = {
    template: 'getEmailDetails2',
    toEmail: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith',
      theUnnamable: ''
    }
  };
  servers.server.methods.getEmailDetails(payload, (err, details) => {
    assert.notEqual(err, null);
    assert.end();
  });
});

test('getEmailDetails - with pagedata )', (assert, servers) => {
  // mock pagedata route for testing, this needs to work with wreck.get:
  async.autoInject({
    pagedataServer(done) {
      const Hapi = require('hapi');
      const server = new Hapi.Server();
      server.connection({ port: 3000, host: 'localhost' });

      server.route({
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
      server.start((err) => {
        if (err) {
          return done(err);
        }
        done(null, server);
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
      servers.server.methods.getEmailDetails(payload, (err, details) => {
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
      });
    }
  }, (err) => {
    assert.equal(err, null);
    assert.end();
  });
});
