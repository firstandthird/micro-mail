'use strict';

const _ = require('lodash');

exports.view = {
  path: '/view/{email}',
  method: 'GET',
  handler(request, reply) {
    const email = request.params.email;

    const testPath = `${request.server.settings.app.views.path}/${email}/test.json`;

    let defaultData = {};
    try {
      defaultData = require(testPath);
    } catch (e) {
      // Nothing... just continue
      request.server.log(['warn', 'view', email], { message: 'test.json not found', testPath });
    }

    const templateData = _.defaults({}, request.query, defaultData);

    reply.view(`${email}/email.html`, templateData);
  }
};
