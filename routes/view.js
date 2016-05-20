'use strict';

const _ = require('lodash');

exports.view = {
  path: '/view/{email}',
  method: 'GET',
  handler(request, reply) {
    const email = request.params.email;
    let defaultData = {};
    try {
      defaultData = require(`${request.server.settings.app.templatePath}/${email}/debug`);
    } catch (e) {
      // Nothing... just continue
      request.server.log(['warn', 'view', email], { message: 'debug.json not found' });
    }

    const templateData = _.defaults({}, request.query, defaultData);

    reply.view(`${email}/email.html`, templateData);
  }
};
