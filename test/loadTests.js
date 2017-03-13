'use strict';
const setup = require('./setup');
const tap = require('tap');

// const tapeExtra = require('tape-extras');
// const tape = require('tape');
//
// const test = tapeExtra(tape, {
//   before(done) {
//     });
//   },
//   after(servers, done) {
//     servers.server.stop(() => {
//       servers.smtpServer.close(() => {
//         done();
//       });
//     });
//   }
// });

let count = 0;
let server = false;
let smtpServer = false;
module.exports = (testName, done) => {
  const assert = tap.test;
  const tempEnd = assert.end;
  assert.end = () => {
    count--;
    if (count === 0) {
      server.stop(() => {
        smtpServer.close(() => {
          tempEnd();
        });
      });
    }
  };
  count++;
  if (count === 1) {
    setup({}, (setupError, returnedServer, returnedSmtpServer) => {
      if (setupError) {
        throw setupError;
      }
      server = returnedServer;
      smtpServer = returnedSmtpServer;
      console.log('start')
      console.log('send gback')
      done(assert, { server, smtpServer });
    });
  }
};
