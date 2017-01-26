'use strict';
const setup = require('./setup');
const tapeExtra = require('tape-extras');
const tape = require('tape');

const test = tapeExtra(tape, {
  before(done) {
    setup({}, (setupError, server, smtpServer) => {
      if (setupError) {
        throw setupError;
      }
      done(null, { server, smtpServer });
    });
  },
  after(servers, done) {
    servers.server.stop(() => {
      servers.smtpServer.close(() => {
        done();
      });
    });
  }
});

module.exports = test;
