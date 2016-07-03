'use strict';
const code = require('code');
const lab = exports.lab = require('lab').script();
const setup = require('./setup.test.js');

let server;
let smtpServer;

lab.afterEach((done) => {
  server.stop(() => {
    smtpServer.close(() => {
      done();
    });
  });
});
lab.beforeEach((done) => {
  setup({}, (configuredServer, configuredSmtpServer) => {
    server = configuredServer;
    smtpServer = configuredSmtpServer;
    done();
  })
});

lab.describe('/send', { timeout: 5000 }, () => {
  lab.it('should exist at POST /send', (done) => {
    const params = {
      from: 'eagles@nest.com',
      to: 'prey@river.com',
      subject: 'inclement weather warning',
      template: 'test-template',
      data: {
        testData: 'value'
      }
    };
    server.inject({
      method: 'POST',
      url: '/send',
      payload: params
    }, (res) => {
      code.expect(res.statusCode).to.equal(200);
      code.expect(res.result.status).to.equal('ok');
      done();
    });
  });
  lab.it('should validate the params', (done) => {
    const badParams = {
      from: 'emal@example.com',
      subject: 'This is a subject',
      text: 'Hello there email text'
    };
    server.inject({
      method: 'POST',
      url: '/send',
      payload: badParams
    }, (res) => {
      code.expect(res.statusCode).to.equal(500);
      done();
    });
  });

  lab.it('should fail if neither text or template provided', (done) => {
    // Neither text or template
    const badParams = {
      from: 'emal@example.com',
      to: 'prey@river.com',
      subject: 'This is a subject',
      data: {
        var: 'value'
      }
    };
    server.inject({
      method: 'POST',
      url: '/send',
      payload: badParams
    }, (res) => {
      code.expect(res.statusCode).to.equal(500);
      done();
    });
  });

  lab.it('should process a template if provided', (done) => {
    // Just template
    const templateParams = {
      from: 'emal@example.com',
      subject: 'This is a subject',
      template: 'test-template',
      data: {
        var: 'value'
      }
    };
    server.inject({
      method: 'POST',
      url: '/send',
      payload: templateParams,
    }, (res) => {
      code.expect(res.statusCode).to.equal(200);
      done();
    });
  });

  lab.it('should process text if provided', (done) => {
    const templateParams = {
      from: 'emal@example.com',
      to: 'prey@river.com',
      subject: 'This is a subject',
      text: 'This is some text value.',
      data: {
        var: 'value'
      }
    };
    server.inject({
      method: 'POST',
      url: '/send',
      payload: templateParams,
    }, (res) => {
      code.expect(res.statusCode).to.equal(200);
      done();
    });
  });

  lab.it('should return 200 on success');

  lab.it('should return the correct success response');

  lab.it('should return the correct error message response');
});
