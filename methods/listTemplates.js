'use strict';

const fs = require('fs');

module.exports = function(req) {
  const server = req.server;
  const templateDir = server.settings.app.views.path;
  const data = fs.readdirSync(templateDir);
  return data;
};
