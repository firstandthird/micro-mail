const Joi = require('joi');

const schema = Joi.object().keys({
  from: Joi.string().required(),
  to: Joi.alternatives().try(Joi.string(), Joi.array()).required(),
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
    // validates:
    Joi.validate(request.payload, schema, (err, value) => {
      if (err) {
        return reply({
          status: 'error',
          message: 'Validation error',
          result: err.details[0].message
        }).code(500);
      }
      request.server.sendEmail(request.payload, (err, results) => {
        if (err) {
          request.server.log(['error', 'send'], { err });
          return reply({
            status: 'error',
            message: 'There has been an error', // Default message for MVP
            result: err
          }).code(500);
        }
        return reply({
          status: 'ok',
          message: 'Email delivered.',
          result: results
        });
      });
    });
  }
};
