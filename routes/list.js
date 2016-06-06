'use strict';

const fs = require('fs');
const _ = require('lodash');
const Handlebars = require('handlebars');

exports.list = {
  path: '/',
  method: 'GET',
  handler(request, reply) {
    const templateDir = request.server.settings.app.views.path;
    fs.readdir(templateDir, (err, files) => {
      if (err) {
        return reply(err);
      }

      fs.readFile('files/index.html', 'utf8', (fileErr, contents) => {
        if (fileErr) {
          return reply(fileErr);
        }

        const viewTemplate = Handlebars.compile(contents);

        return reply(viewTemplate({ files }));
      });
    });
  }
};
