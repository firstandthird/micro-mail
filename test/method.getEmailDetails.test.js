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
    },
    disableTracking: true // disable the tracking pixel and uuid generation
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
        serviceName: 'test city',
        trackingPixel: ''
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
      lastName: 'smith',
      trackingPixel: ''
    },
    disableTracking: true
  };
  server.methods.getEmailDetails(payload, (err, details) => {
    assert.equal(err, null, 'no errors');
    assert.deepEqual(details, {
      template: 'no yaml',
      toEmail: 'bob.smith@firstandthird.com',
      data: {
        firstName: 'bob',
        lastName: 'smith',
        trackingPixel: ''
      },
      default1: 'yay default'
    }, 'getEmailDetails sets up details with no yaml');
    assert.end();
  });
});

tap.test('getEmailDetails - with yaml and tracking enabled', (assert) => {
  const payload = {
    template: 'getEmailDetails2',
    toEmail: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith'
    },
    trackingData: {
      tags: {
        tagOne: 'one'
      }
    }
  };
  server.methods.getEmailDetails(payload, (err, details) => {
    assert.equal(err, null, 'no errors');
    assert.ok(details.data.trackingPixel, 'Tracking pixel exists');
    assert.ok(details.uuid, 'UUID passed back');
    delete details.uuid;
    delete details.data.trackingPixel;

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
      trackingData: {
        tags: {
          tagOne: 'one'
        }
      },
      default1: 'yay default',
    }, 'getEmailDetails sets up details correctly');
    assert.end();
  });
});

tap.test('getEmailDetails will not validate if missing required fields', (assert) => {
  const payload = {
    template: 'getEmailDetails2',
    toEmail: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith'
    },
    requiredData: ['age'],
    disableTracking: true
  };
  server.methods.getEmailDetails(payload, (err, details) => {
    assert.notEqual(err, null);
    assert.equal(err.message, 'missing data for age');
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
      age: ''
    },
    requiredData: ['age'],
    disableTracking: true
  };
  server.methods.getEmailDetails(payload, (err, details) => {
    assert.notEqual(err, null);
    assert.equal(err.message, 'missing data for age');
    assert.end();
  });
});

tap.test('getEmailDetails - with pagedata for data', (assert) => {
  // mock pagedata route for testing, this needs to work with wreck.get:
  async.autoInject({
    pagedataServer(done) {
      const Hapi = require('hapi');
      const pagedataServer = new Hapi.Server();
      pagedataServer.connection({ port: 3000, host: 'localhost' });
      pagedataServer.route({
        path: '/api/pages/{page}',
        method: 'GET',
        handler(request, reply) {
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
        },
        disableTracking: true
      };
      server.methods.getEmailDetails(payload, (err, details) => {
        assert.equal(err, null, 'no errors');
        assert.deepEqual(details, {
          default1: 'yay default',
          template: 'getEmailDetailsPagedata',
          pagedata: 'slug',
          subject: 'This is a subject to bob',
          toName: 'bob',
          toEmail: 'bob.smith@firstandthird.com',
          data: {
            firstName: 'bob',
            trackingPixel: ''
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

tap.test('getEmailDetails - with pagedata for template', (assert) => {
  // mock pagedata route for testing, this needs to work with wreck.get:
  async.autoInject({
    pagedataServer(done) {
      const Hapi = require('hapi');
      const pagedataServer = new Hapi.Server();
      pagedataServer.connection({ port: 3000, host: 'localhost' });
      pagedataServer.route({
        path: '/api/pages/{page}',
        method: 'GET',
        handler(request, reply) {
          assert.equal(request.params.page, 'slug');
          assert.equal(request.query.tag, 'tag');
          reply(null, {
            content: {
              template: 'getEmailDetailsPagedata',
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
        pagedata: 'slug',
        toEmail: 'bob.smith@firstandthird.com',
        data: {
          firstName: 'bob'
        },
        disableTracking: true
      };
      server.methods.getEmailDetails(payload, (err, details) => {
        assert.equal(err, null, 'no errors');
        assert.deepEqual(details, {
          default1: 'yay default',
          template: 'getEmailDetailsPagedata',
          pagedata: 'slug',
          subject: 'This is a subject to bob',
          toName: 'bob',
          toEmail: 'bob.smith@firstandthird.com',
          data: {
            firstName: 'bob',
            trackingPixel: ''
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

tap.test('getEmailDetails - with pagedata example data', (assert) => {
  // mock pagedata route for testing, this needs to work with wreck.get:
  async.autoInject({
    pagedataServer(done) {
      const Hapi = require('hapi');
      const pagedataServer = new Hapi.Server();
      pagedataServer.connection({ port: 3000, host: 'localhost' });
      pagedataServer.route({
        path: '/api/pages/{page}',
        method: 'GET',
        handler(request, reply) {
          assert.equal(request.params.page, 'slug');
          assert.equal(request.query.tag, 'tag');
          reply(null, {
            content: {
              template: 'getEmailDetailsPagedata',
              subject: 'This is a subject to {{data.firstName}}',
              toName: '{{data.firstName}}',
              example: {
                firstName: 'bob'
              }
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
        pagedata: 'slug',
        toEmail: 'bob.smith@firstandthird.com',
        disableTracking: true
      };
      server.methods.getEmailDetails(payload, { useExampleData: true }, (err, details) => {
        assert.equal(err, null, 'no errors');
        assert.deepEqual(details, {
          default1: 'yay default',
          template: 'getEmailDetailsPagedata',
          pagedata: 'slug',
          subject: 'This is a subject to bob',
          toName: 'bob',
          toEmail: 'bob.smith@firstandthird.com',
          data: {
            firstName: 'bob',
            trackingPixel: ''
          },
          example: {
            firstName: 'bob',
            trackingPixel: ''
          }
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

tap.test('getEmailDetails - with pagedata requiredData', (assert) => {
  // mock pagedata route for testing, this needs to work with wreck.get:
  async.autoInject({
    pagedataServer(done) {
      const Hapi = require('hapi');
      const pagedataServer = new Hapi.Server();
      pagedataServer.connection({ port: 3000, host: 'localhost' });
      pagedataServer.route({
        path: '/api/pages/{page}',
        method: 'GET',
        handler(request, reply) {
          assert.equal(request.params.page, 'slug');
          assert.equal(request.query.tag, 'tag');
          reply(null, {
            content: {
              template: 'getEmailDetailsPagedata',
              subject: 'This is a subject to {{data.firstName}}',
              toName: '{{data.firstName}}',
              example: {
                firstName: 'bob'
              },
              requiredData: ['firstName']
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
        pagedata: 'slug',
        toEmail: 'bob.smith@firstandthird.com',
        disableTracking: true
      };
      server.methods.getEmailDetails(payload, (err, details) => {
        assert.notEqual(err, null, 'should error');
        assert.equal(err.message, 'missing data for firstName');

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
