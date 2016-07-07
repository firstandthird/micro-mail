'use strict';
const Joi = require('joi');

const schema = Joi.object().keys({
  from: Joi.string().required(),
  to: Joi.string().required(),
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
    if (request.payload && typeof request.payload.to === 'object') {
      request.payload.to = request.payload.to.join(',');
    }
    // validates:
    Joi.validate(request.payload, schema, (err2) => {
      if (err2) {
        return reply({
          status: 'error',
          message: 'Validation error',
          result: err2.details[0].message
        }).code(500);
      }
      request.server.sendEmail(request.payload, request.query.sendIndividual, (err, results) => {
        if (err) {
          return reply(results).code(500);
        }
        return reply(results);
      });
    });
  }
};
