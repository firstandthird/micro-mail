'use strict';

const fs = require('fs');

module.exports = function(req, next) {
  const server = req.server;
  const templateDir = server.settings.app.views.path;

  fs.readdir(templateDir, (err, data) => {
    if (err) {

    }

    next(data);
  });
};
