'use strict';
const Joi = require('joi');

exports.send = {
  path: '/send',
  method: 'POST',
  config: {
    validate: {
      payload: Joi.object().keys({
        from: Joi.string().required(),
        to: Joi.alternatives().try(Joi.string(), Joi.array()).required(),
        fromName: Joi.string(),
        data: Joi.object(),
        text: Joi.string(),
        template: Joi.string(),
        subject: Joi.string()
      }).or('text', 'template')
    }
  },
  handler: {
    autoInject: {
      payload(server, request, done) {
        const payload = request.payload;
        if (request.query.test) {
          const testPath = `${server.settings.app.views.path}/${request.payload.template}/test.json`;
          payload.data = require(testPath);
        }
        done(null, payload);
      },
      details(server, payload, done) {
        server.methods.getEmailDetails(payload, done);
      },
      content(server, details, done) {
        server.methods.getEmailContent(details.template, details.data, done);
      },
      mailObj(server, details, done) {
        done();
      },
      send(server, mailObj, done) {
        server.methods.sendMail(mailObj, done);
      },
      reply(send, done) {
        done({
          status: 'ok',
          message: 'Email delivered.',
          result: send
        });
      }
    }
  }
};
