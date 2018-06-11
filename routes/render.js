'use strict';

const Joi = require('joi');

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
        disableTracking: Joi.bool().default(false).optional()
      }).or('text', 'template', 'pagedata')
    }
  },
  async handler (request, h) => {
    const server = request.server;
    const payload = request.payload || request.query;
    if (request.query.test) {
      const testPath = `${server.settings.app.views.path}/${request.payload.template}/test.json`;
      payload.data = require(testPath);
    }
    const details = await server.methods.getEmailDetails(payload);
    const content = await server.methods.getEmailContent(details.template, details.data);
    const data = await server.methods.getMailObject(details, content);
    return data;
  }
};
