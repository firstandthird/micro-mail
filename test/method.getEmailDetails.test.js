'use strict';
const tap = require('tap');
const Rapptor = require('rapptor');
const path = require('path');

let rapptor;
let server;
tap.beforeEach(async () => {
  rapptor = new Rapptor({
    config: {
      templatePath: `${__dirname}`
    }
  });
  await rapptor.start();
  server = rapptor.server;
  server.settings.app.views.path = path.join(__dirname, 'emails');
});

tap.afterEach(async () => {
  await rapptor.stop();
});

tap.test('getEmailDetails - with yaml', async (assert) => {
  const payload = {
    template: 'getEmailDetails2',
    to: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith'
    },
    disableTracking: true // disable the tracking pixel and uuid generation
  };
  const details = await server.methods.getEmailDetails(payload);
  assert.deepEqual(details, {
    subject: 'Hi there bob test city',
    template: 'getEmailDetails2',
    fromName: 'Micro Mail',
    fromEmail: 'code@firstandthird.com',
    toName: 'bob smith',
    to: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith',
      serviceName: 'test city',
      trackingPixel: '',
      disableTracking: true
    },
    default1: 'yay default'
  }, 'getEmailDetails sets up details correctly');
  assert.end();
});

tap.test('getEmailDetails - with no yaml', async (assert) => {
  const payload = {
    template: 'no yaml',
    to: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith',
      trackingPixel: '',
      disableTracking: true
    },
    disableTracking: true
  };
  const details = await server.methods.getEmailDetails(payload);
  assert.deepEqual(details, {
    template: 'no yaml',
    to: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith',
      trackingPixel: '',
      disableTracking: true
    },
    default1: 'yay default'
  }, 'getEmailDetails sets up details with no yaml');
  assert.end();
});

tap.test('getEmailDetails - with yaml and tracking enabled', async (assert) => {
  // metrics must be on for tracking:
  server.settings.app.enableMetrics = true;
  const payload = {
    template: 'getEmailDetails2',
    to: 'bob.smith@firstandthird.com',
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
  const details = await server.methods.getEmailDetails(payload);
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
    to: 'bob.smith@firstandthird.com',
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

tap.test('getEmailDetails will not validate if missing required fields', async (assert) => {
  const payload = {
    template: 'getEmailDetails2',
    to: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith'
    },
    requiredData: ['age'],
    disableTracking: true
  };
  try {
    await server.methods.getEmailDetails(payload);
    assert.fail();
  } catch (err) {
    assert.equal(err.message, 'missing data for age');
    assert.end();
  }
});

tap.test('getEmailDetails will not validate if data fields are blank', async (assert) => {
  const payload = {
    template: 'getEmailDetails2',
    to: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      lastName: 'smith',
      age: ''
    },
    requiredData: ['age'],
    disableTracking: true
  };
  try {
    await server.methods.getEmailDetails(payload);
    assert.fail();
  } catch (err) {
    assert.equal(err.message, 'missing data for age');
    assert.end();
  }
});

tap.test('getEmailDetails - with pagedata for data', async (assert) => {
  // mock pagedata route for testing, this needs to work with wreck.get:
  const Hapi = require('hapi');
  const pagedataServer = new Hapi.Server({ port: 3000 });
  pagedataServer.route({
    path: '/api/pages/{page}',
    method: 'GET',
    handler(request, h) {
      assert.equal(request.params.page, 'slug');
      return {
        content: {
          subject: 'This is a subject to {{data.firstName}}',
          toName: '{{data.firstName}}'
        }
      };
    }
  });
  await pagedataServer.start();
  const payload = {
    template: 'getEmailDetailsPagedata',
    to: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob'
    },
    disableTracking: true
  };
  const details = await server.methods.getEmailDetails(payload);
  assert.deepEqual(details, {
    default1: 'yay default',
    template: 'getEmailDetailsPagedata',
    pagedata: 'slug',
    subject: 'This is a subject to bob',
    toName: 'bob',
    to: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      trackingPixel: '',
      disableTracking: true
    },
  }, 'getEmailDetails sets up details correctly');
  await pagedataServer.stop();
  assert.end();
});

tap.test('getEmailDetails - with pagedata for template', async (assert) => {
  // mock pagedata route for testing, this needs to work with wreck.get:
  const Hapi = require('hapi');
  const pagedataServer = new Hapi.Server({ port: 3000 });
  pagedataServer.route({
    path: '/api/pages/{page}',
    method: 'GET',
    handler(request, h) {
      assert.equal(request.params.page, 'slug');
      return {
        content: {
          template: 'getEmailDetailsPagedata',
          subject: 'This is a subject to {{data.firstName}}',
          toName: '{{data.firstName}}'
        }
      };
    }
  });
  await pagedataServer.start();
  const payload = {
    pagedata: 'slug',
    to: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob'
    },
    disableTracking: true
  };
  const details = await server.methods.getEmailDetails(payload);
  assert.deepEqual(details, {
    default1: 'yay default',
    template: 'getEmailDetailsPagedata',
    pagedata: 'slug',
    subject: 'This is a subject to bob',
    toName: 'bob',
    to: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      trackingPixel: '',
      disableTracking: true
    },
  }, 'getEmailDetails sets up details correctly');
  await pagedataServer.stop();
  assert.end();
});

tap.test('getEmailDetails - with pagedata example data', async (assert) => {
  // mock pagedata route for testing, this needs to work with wreck.get:
  const Hapi = require('hapi');
  const pagedataServer = new Hapi.Server({ port: 3000 });
  pagedataServer.route({
    path: '/api/pages/{page}',
    method: 'GET',
    handler(request, h) {
      assert.equal(request.params.page, 'slug');
      return {
        content: {
          template: 'getEmailDetailsPagedata',
          subject: 'This is a subject to {{data.firstName}}',
          toName: '{{data.firstName}}',
          example: {
            firstName: 'bob'
          }
        }
      };
    }
  });
  await pagedataServer.start();
  const payload = {
    pagedata: 'slug',
    to: 'bob.smith@firstandthird.com',
    disableTracking: true
  };
  const details = await server.methods.getEmailDetails(payload, { useExampleData: true });
  assert.deepEqual(details, {
    default1: 'yay default',
    template: 'getEmailDetailsPagedata',
    pagedata: 'slug',
    subject: 'This is a subject to bob',
    toName: 'bob',
    to: 'bob.smith@firstandthird.com',
    data: {
      firstName: 'bob',
      trackingPixel: '',
      disableTracking: true
    },
    example: {
      firstName: 'bob',
      trackingPixel: '',
      disableTracking: true
    }
  }, 'getEmailDetails sets up details correctly');
  await pagedataServer.stop();
  assert.end();
});

tap.test('getEmailDetails - with tracking and pagedata and array too', async (assert) => {
  // mock pagedata route for testing, this needs to work with wreck.get:
  const Hapi = require('hapi');
  const pagedataServer = new Hapi.Server({ port: 3000 });
  pagedataServer.route({
    path: '/api/pages/{page}',
    method: 'GET',
    handler(request, h) {
      assert.equal(request.params.page, 'pagedata-slug');
      return {
        content: {
          template: 'getEmailDetailsPagedata',
          subject: 'This is a subject to {{data.firstName}}',
          toName: '{{data.firstName}}',
          example: {
            firstName: 'bob'
          }
        }
      };
    }
  });
  await pagedataServer.start();
  const payload = {
    pagedata: 'pagedata-slug',
    to: ['bob.smith@firstandthird.com', 'john@firstandthird.com'],
    disableTracking: false
  };
  const details = await server.methods.getEmailDetails(payload, { useExampleData: true });
  const trackingPixel = details.data.trackingPixel;
  delete details.data.trackingPixel;
  delete details.uuid;
  assert.contains(trackingPixel, 'template:getEmailDetailsPagedata,pagedataSlug:pagedata-slug');
  assert.contains(trackingPixel, 'bob.smith@firstandthird.com|john@firstandthird.com');

  assert.deepEqual(details, {
    default1: 'yay default',
    template: 'getEmailDetailsPagedata',
    pagedata: 'pagedata-slug',
    subject: 'This is a subject to bob',
    toName: 'bob',
    to: ['bob.smith@firstandthird.com', 'john@firstandthird.com'],
    data: {
      firstName: 'bob'
    },
    example: {
      firstName: 'bob'
    }
  }, 'getEmailDetails sets up details correctly');
  await pagedataServer.stop();
  assert.end();
});
tap.test('getEmailDetails - with tracking and pagedata', async (assert) => {
  // mock pagedata route for testing, this needs to work with wreck.get:
  const Hapi = require('hapi');
  const pagedataServer = new Hapi.Server({ port: 3000 });
  pagedataServer.route({
    path: '/api/pages/{page}',
    method: 'GET',
    handler(request, h) {
      assert.equal(request.params.page, 'pagedata-slug');
      return {
        content: {
          template: 'getEmailDetailsPagedata',
          subject: 'This is a subject to {{data.firstName}}',
          toName: '{{data.firstName}}',
          example: {
            firstName: 'bob'
          }
        }
      };
    }
  });
  await pagedataServer.start();
  const payload = {
    pagedata: 'pagedata-slug',
    to: 'bob.smith@firstandthird.com,john@firstandthird.com',
    disableTracking: false
  };
  const details = await server.methods.getEmailDetails(payload, { useExampleData: true });
  const trackingPixel = details.data.trackingPixel;
  delete details.data.trackingPixel;
  delete details.uuid;
  assert.contains(trackingPixel, 'template:getEmailDetailsPagedata,pagedataSlug:pagedata-slug');
  assert.contains(trackingPixel, 'bob.smith@firstandthird.com|john@firstandthird.com');

  assert.deepEqual(details, {
    default1: 'yay default',
    template: 'getEmailDetailsPagedata',
    pagedata: 'pagedata-slug',
    subject: 'This is a subject to bob',
    toName: 'bob',
    to: 'bob.smith@firstandthird.com,john@firstandthird.com',
    data: {
      firstName: 'bob'
    },
    example: {
      firstName: 'bob'
    }
  }, 'getEmailDetails sets up details correctly');
  await pagedataServer.stop();
  assert.end();
});

tap.test('getEmailDetails - with pagedata requiredData', async (assert) => {
  // mock pagedata route for testing, this needs to work with wreck.get:
  const Hapi = require('hapi');
  const pagedataServer = new Hapi.Server({ port: 3000 });
  pagedataServer.route({
    path: '/api/pages/{page}',
    method: 'GET',
    handler(request, h) {
      assert.equal(request.params.page, 'slug');
      return {
        content: {
          template: 'getEmailDetailsPagedata',
          subject: 'This is a subject to {{data.firstName}}',
          toName: '{{data.firstName}}',
          example: {
            firstName: 'bob'
          },
          requiredData: ['firstName']
        }
      };
    }
  });
  await pagedataServer.start();
  const payload = {
    pagedata: 'slug',
    to: 'bob.smith@firstandthird.com',
    disableTracking: true
  };
  try {
    await server.methods.getEmailDetails(payload);
    assert.fail();
  } catch (err) {
    assert.notEqual(err, null, 'should error');
    await pagedataServer.stop();
    assert.end();
  }
});
