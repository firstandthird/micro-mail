const Joi = require('joi');

const schema = Joi.object().keys({
  from: Joi.string().required(),
  to: Joi.string(),
  data: Joi.object(),
  text: Joi.string().required(),
  template: Joi.string().required(),
  subject: Joi.string()
}).without('text', 'template');

exports.send = {
  path: '/send',
  method: 'POST',
  handler(request, reply) {
    const testPath = `${request.server.settings.app.views.path}/${request.payload.template}/test.json`;
    if (request.query.test) {
      request.payload.data = require(testPath);
    }
    // validates:
    console.log('-----------------------validating')
    Joi.validate(request.payload, schema, (err, value) => {
      if (err) {
        console.log('===============================no validation')
        console.log(request.payload)
        return reply(err).code(500);
      }
      console.log('passed validation.................................')
      console.log(request.payload)
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
