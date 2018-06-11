const Joi = require('joi');

exports.send = {
  path: '/send',
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
        disableTracking: Joi.bool().default(false).optional(),
        headers: Joi.object().optional()
      }).or('text', 'template', 'pagedata')
    }
  },
  async handler (request, h) => {
    const server = request.server;
    const payload = request.payload;
    if (request.query.test) {
      const testPath = `${server.settings.app.views.path}/${request.payload.template}/test.json`;
      payload.data = require(testPath);
    }
    const details = await server.methods.getEmailDetails(payload);
    const content = await server.methods.getEmailContent(details.template, details.data);
    const mailObj = await server.methods.getMailObject(details, content);
    let stat = 'success';
    const logObj = {
      template: details.template,
      toEmail: mailObj.to,
    };
    let send;
    try {
      send = await server.methods.sendMail(mailObj, details.sendIndividual);
      logObj.result = send;
    } catch (err) {
      stat = 'error';
      logObj.err = err;
    }
    // log email send
    if (details.uuid) {
      logObj.uuid = details.uuid;
    }
    if (details.pagedata) {
      logObj.pagedata = details.pagedata;
    }
    server.log(['email', 'send', stat], logObj);
    if (server.settings.app.enableMetrics) {
      const trackingTags = (details.trackingData) ? details.trackingData.tags : {};
      const tags = Object.assign({}, { template: details.template }, trackingTags);
      if (details.pagedata && details.pagedata) {
        tags.pagedataSlug = details.pagedata;
      }
      server.track('email.send', 1, tags, { toEmail: details.to, uuid: details.uuid });
    }
    return {
      status: 'ok',
      message: 'Email delivered.',
      result: send
    };
  }
};
