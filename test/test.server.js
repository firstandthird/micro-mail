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

const allData = [];
lab.describe('/send?test', { timeout: 5000}, () => {
  lab.beforeEach((done) => {
    setup({
      onData: (stream, session, callback) => {
        stream.on('end', () => {
          return callback(null, 'Message queued');
        });
        stream.on('data', (data) => {
          allData.push(data.toString());
        });
      }
    }, (configuredServer, configuredSmtpServer) => {
      server = configuredServer;
      smtpServer = configuredSmtpServer;
      done();
    });
  });

  lab.it('should overload the submitted data with test.json if "test" query is true ', (done) => {
    const textParams = {
      from: 'emal@example.com',
      to: 'prey@river.com',
      template: 'test-template-json',
      data: {
        var: 'value'
      }
    };
    server.inject({
      method: 'POST',
      url: '/send?test=true',
      payload: textParams,
    }, (res) => {
      code.expect(allData.length).to.equal(1);
      code.expect(allData[0]).to.include('fish@lake.com');
      code.expect(allData[0]).to.include('alligator@thebank.com');
      done();
    });
  });
});
