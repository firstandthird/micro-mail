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
        server.methods.sendMail(mailObj, details.sendIndividual, (err, result) => {
          // log email send
          const logObj = {
            template: details.template,
            toEmail: mailObj.to,
            result
          };

          if (details.uuid) {
            logObj.uuid = details.uuid;
          }

          if (details.pagedata && details.pagedata.slug) {
            logObj.pagedata = details.pagedata.slug;
          }

          const stat = (err) ? 'error' : 'success';
          if (err) {
            logObj.err = err;
          }
          server.log(['email', 'send', stat], logObj);
          done(err, result);
        });
      },
      track(server, details, send, done) {
        if (server.settings.app.enableMetrics) {
          const tags = { template: details.template };
          if (details.pagedata && details.pagedata.slug) {
            tags.pagedataSlug = details.pagedata.slug;
          }
          server.track('email.send', null, tags, { toEmail: details.to, uuid: details.uuid });
        }
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
