'use strict';

const Lab = require('lab');
const lab = exports.lab = Lab.script();

const describe = lab.describe;
const before = lab.before;
const after = lab.after;
const it = lab.it;
const expect = require('chai').expect;

const Rapptor = require('rapptor');
const rapptor = new Rapptor();

const async = require('async');

describe('Routes', () => {
  before((done) => {
    rapptor.start(done);
  });

  after((done) => {
    rapptor.stop(done);
  });

  describe('/send', () => {
    it('should exist at POST /send', (done) => {
      const params = {
        to: 'email@example.com',
        template: 'test-template',
        data: {
          testData: 'value'
        }
      };

      rapptor.server.inject({
        method: 'POST',
        url: '/send',
        payload: params
      }, (res) => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    it('should validate the params', (done) => {
      const badParams = {
        from: 'emal@example.com',
        subject: 'This is a subject',
        text: 'Hello there email text'
      };
      rapptor.server.inject({
        method: 'POST',
        url: '/send',
        payload: badParams
      }, (res) => {
        expect(res.statusCode).to.equal(500);
        done();
      });
    });

    it('should require either text or template', (done) => {
      expect(true).to.equal(false);
      async.parallel([
        function(next) {
          // Neither text or template
          const badParams = {
            from: 'emal@example.com',
            subject: 'This is a subject',
            data: {
              var: 'value'
            }
          };
          rapptor.server.inject({
            method: 'POST',
            url: '/send',
            payload: badParams
          }, (res) => {
            expect(res.statusCode).to.equal(500);
            next();
          });
        },
        function(next) {
          // Just template
          const templateParams = {
            from: 'emal@example.com',
            subject: 'This is a subject',
            template: 'some-email-template',
            data: {
              var: 'value'
            }
          };
          rapptor.server.inject({
            method: 'POST',
            url: '/send',
            payload: templateParams,
          }, (res) => {
            expect(res.statusCode).to.equal(200);
            next();
          });
        },
        function(next) {
          // Just text
          const templateParams = {
            from: 'emal@example.com',
            subject: 'This is a subject',
            text: 'This is some text value.',
            data: {
              var: 'value'
            }
          };
          rapptor.server.inject({
            method: 'POST',
            url: '/send',
            payload: templateParams,
          }, (res) => {
            expect(res.statusCode).to.equal(200);
            next();
          });
        }
      ], done);
    });

    it('should return 200 on success');

    it('should return the correct success response');

    it('should return the correct error message response');
  });
});
