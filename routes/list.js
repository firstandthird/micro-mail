'use strict';

const fs = require('fs');
const Nunjucks = require('nunjucks');

exports.list = {
  path: '/_list',
  method: 'GET',
  config: {
    pre: [
      {
        method: 'listTemplates',
        assign: 'templates'
      }
    ]
  },
  handler(request, reply) {
    fs.readFile('files/index.html', 'utf8', (fileErr, contents) => {
      if (fileErr) {
        return reply(fileErr);
      }

      const files = request.pre.templates;
      const template = Nunjucks.compile(contents);

      return reply(template.render({ files }));
    });  
  }
};
