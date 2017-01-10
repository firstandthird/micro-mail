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
  });
});

lab.describe('/send', { timeout: 5000 }, () => {

  lab.it('should exist at POST /send', (done) => {
    const params = {
      from: 'eagles@nest.com',
      to: 'prey@river.com',
      subject: 'inclement weather warning',
      template: 'test-template',
      fromName: 'Big E',
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
      code.expect(res.result.result).to.equal('"to" is required');
      code.expect(res.result.status).to.equal('error');
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
      to: 'prey@river.com',
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
    const textParams = {
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
      payload: textParams,
    }, (res) => {
      code.expect(res.statusCode).to.equal(200);
      done();
    });
  });

  lab.it('should return the correct success response', (done) => {
    const textParams = {
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
      payload: textParams,
    }, (res) => {
      code.expect(res.statusCode).to.equal(200);
      code.expect(res.result.status).to.equal('ok');
      code.expect(res.result.message).to.equal('Email delivered.');
      code.expect(res.result.result.result.rejected.length).to.equal(0);
      code.expect(res.result.result.result.response).to.include('250');
      done();
    });
  });

  lab.it('should return the correct error message response', (done) => {
    const textParams = {
      from: 'emal@example.com',
      subject: 'This is a subject',
      text: 'This is some text value.',
      data: {
        var: 'value'
      }
    };
    server.inject({
      method: 'POST',
      url: '/send',
      payload: textParams,
    }, (res) => {
      code.expect(res.statusCode).to.equal(500);
      code.expect(res.result.result).to.equal('"to" is required');
      code.expect(res.result.status).to.equal('error');
      done();
    });
  });
});

lab.describe('/send many', { timeout: 5000 }, () => {
  lab.it('should be able to send multiple destination emails at once as a comma-separated string', (done) => {
    const params = {
      from: 'eagles@nest.com',
      to: 'prey@river.com, fish@lake.com',
      subject: 'What times are you available later?',
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
  lab.it('should be able to send multiple destination emails at once as an array of strings', (done) => {
    const params = {
      from: 'eagles@nest.com',
      to: ['prey@river.com', 'fish@lake.com'],
      subject: 'What times are you available later?',
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
  lab.it('will send separate emails to several destinations and return 200 if all were good', (done) => {
    const templateParams = {
      to: 'prey@river.com, vultures@largetree.com,crows@rock.com',
      from: 'emal@example.com',
      subject: 'This is a subject',
      template: 'test-template-individual',
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
      code.expect(res.result.result.length).to.equal(3);
      done();
    });
  });

  lab.it('will return 500 if any email fails and list status for specific emails', (done) => {
    const templateParams = {
      to: 'prey@river.com,notanaddress,crows@rock.com',
      from: 'emal@example.com',
      subject: 'This is a subject',
      template: 'test-template-individual',
      data: {
        var: 'value'
      }
    };
    server.inject({
      method: 'POST',
      url: '/send',
      payload: templateParams,
    }, (res) => {
      code.expect(res.statusCode).to.equal(500);
      code.expect(res.result.message).to.equal('There has been an error');
      done();
    });
  });
});
