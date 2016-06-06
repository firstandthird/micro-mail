'use strict';

const fs = require('fs');
const _ = require('lodash');

exports.list = {
  path: '/',
  method: 'GET',
  handler(request, reply) {
    const templateDir = request.server.settings.app.views.path;
    fs.readdir(templateDir, (err, files) => {
      if (err) {
        return reply(err);
      }

      files = _.map(files, (file) => {
        const link = `<a href="/view/${file}">${file}</a>`;
        return link;
      });

      reply(files.join('<br/>'));
    });
  }
};
