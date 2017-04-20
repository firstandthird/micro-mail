'use strict';
const Joi = require('joi');

exports.send = {
  path: '/send',
  method: 'POST',
  config: {
    validate: {
      payload: Joi.object().keys({
        from: Joi.string(),
        fromEmail: Joi.string(),
        fromName: Joi.string(),
        to: Joi.alternatives().try(Joi.string(), Joi.array()).required(),
        inlineCss: Joi.bool(),
        data: Joi.object(),
        text: Joi.string(),
        template: Joi.string(),
        subject: Joi.string(),
        pagedata: Joi.object().keys({
          slug: Joi.string(),
          tag: Joi.string().optional()
        })
      }).or('text', 'template', 'pagedata')
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
      mailObj(server, details, content, done) {
        server.methods.getMailObject(details, content, done);
      },
      send(server, mailObj, details, done) {
        server.methods.sendMail(mailObj, details.sendIndividual, done);
      },
      track(server, details, send, done) {
        server.track('email.send', 1, { template: details.template }, { toEmail: details.to, uuid: details.uuid });
        done(null);
      },
      reply(send, done) {
        done(null, {
          status: 'ok',
          message: 'Email delivered.',
          result: send
        });
      }
    }
  }
};
