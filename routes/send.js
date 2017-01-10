'use strict';
const Joi = require('joi');
const yamljs = require('yamljs');
const _ = require('lodash');

const schema = Joi.object().keys({
  from: Joi.string().required(),
  fromName: Joi.string(),
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
    const debug = (request.query.debug !== undefined);
    // validates:
    Joi.validate(request.payload, schema, (err2) => {
      if (err2) {
        const errMessage = err2.details.map((detail) => detail.message).join('::');
        return reply({
          status: 'error',
          message: 'Validation error',
          result: errMessage
        }).code(500);
      }
      const template = request.payload.template || null;
      let emailDetails = {};
      const server = request.server;
      const templateDir = `${server.settings.app.views.path}/${template}`;
      if (template !== null) {
        try {
          emailDetails = yamljs.load(`${templateDir}/details.yaml`);
        } catch (e) {
          // Do nothing, continue
        }
      }
      const defaultDetails = (server.settings.app.emails && server.settings.app.emails.defaultDetails) ? server.settings.app.emails.defaultDetails : {};
      const finalDetails = _.defaults({}, request.payload, emailDetails, defaultDetails);
      const sendIndividual = finalDetails.sendIndividual || false;
      request.server.sendEmail(request.payload, debug, sendIndividual, (err3, results) => {
        if (err3) {
          request.server.log(['error', 'send'], { err3 });
          return reply({
            status: 'error',
            message: 'There has been an error', // Default message for MVP
            result: err3
          }).code(500);
        }
        if (debug) {
          request.server.log(['info'], results);
        }
        if (sendIndividual) {
          results.forEach((result) => {
            if (result.response !== '250 Message queued') {
              return reply({
                status: 'failed',
                message: 'There has been an error.',
                result: results
              }).code(500);
            }
          });
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
