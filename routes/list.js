'use strict';

const fs = require('fs');
const Nunjucks = require('nunjucks');

exports.list = {
  path: '/_list',
  method: 'GET',
  handler(request, h) {
    const routePrefix = request.server.settings.app.routePrefix;
    const apiKey = request.query.token;

    const contents = fs.readFileSync('files/index.html', 'utf8');
    const files = request.server.methods.listTemplates(request);
    const template = Nunjucks.compile(contents);
    return template.render({ files, routePrefix, apiKey });
  }
};
