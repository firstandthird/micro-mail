const Joi = require('joi');
const boom = require('boom');

exports.render = {
  path: '/render',
  method: 'POST',
  config: {
    auth: 'apikey',
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
        pagedata: Joi.string(),
        trackingData: Joi.object().optional(),
        disableTracking: Joi.bool().optional()
      }).or('text', 'template', 'pagedata')
    }
  },
  handler: {
    autoInject: {
      payload(server, request, done) {
        const payload = request.payload || request.query;
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
      mailObj(server, details, content, reply, done) {
        server.methods.getMailObject(details, content, (err, data) => {
          if (err) {
            return reply(boom.badRequest(err));
          }
          reply(null, data.html);
          done();
        });
      }
    }
  }
};
