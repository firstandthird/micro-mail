const Joi = require('joi');
const omit = require('lodash.omit');
const async = require('async');

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
    // validates:
    Joi.validate(request.payload, schema, (err, value) => {
      if (err) {
        return reply({
          status: 'error',
          message: 'Validation error',
          result: err.details[0].message
        }).code(500);
      }
      const getResult = (err, results) => {
        if (err) {
          request.server.log(['error', 'send'], { err });
          return {
            status: 'error',
            message: 'There has been an error', // Default message for MVP
            result: err
          }
        }
        return {
          status: 'ok',
          message: 'Email delivered.',
          result: results
        };
      };
      if (request.query.sendMany) {
        // will send each individually and return a single
        // list of all results
        const toList = request.payload.to.split(",");
        const allResults = [];
        const allSucceeded = true;
        async.each(toList, (item, done) => {
          const curPayload = omit(request.payload, 'to');
          curPayload.to = item.trim();
          request.server.sendEmail(curPayload, (err, result) => {
            if (err) {
              allSucceeded = false;
            }
            allResults.push(getResult(err, result));
            done();
          });
        }, () => {
          if (allSucceeded) {
            return reply(allResults);
          }
          return reply(allResults).code(500);
        });
      } else {
        request.server.sendEmail(request.payload, (err, results) => {
          if (err) {
            return reply(getResult(err, results)).code(500);
          }
          return reply(getResult(err, results));
        });
      }
    });
  }
};
