'use strict';
const Joi = require('joi');

const schema = Joi.object().keys({
  from: Joi.string().required(),
  to: Joi.alternatives().try(Joi.string(), Joi.array()).required(),
  fromName: Joi.string(),
  data: Joi.object(),
  text: Joi.string(),
  template: Joi.string(),
  subject: Joi.string()
}).or('text', 'template');

exports.send = {
  path: '/send',
  method: 'POST',
  handler(request, reply) {
    const testPath = `${request.server.settings.app.views.path}/${request.payload.template}/test.json`;
    if (request.query.test) {
      request.payload.data = require(testPath);
    }

    const debug = (request.query.debug !== undefined);

    // validates:
    Joi.validate(request.payload, schema, (err) => {
      if (err) {
        return reply({
          status: 'error',
          message: 'Validation error',
          result: err.details[0].message
        }).code(500);
      }
      request.server.sendEmail(request.payload, debug, (err2, results) => {
        if (err2) {
          request.server.log(['error', 'send'], { err2 });
          return reply({
            status: 'error',
            message: 'There has been an error', // Default message for MVP
            result: err
          }).code(500);
        }

        if (debug) {
          request.server.log(['info'], results);
        }

        return reply({
          status: 'ok',
          message: 'Email delivered.',
          result: results.send
        });
      });
    });
  }
};
