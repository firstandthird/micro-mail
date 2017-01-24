'use strict';
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

module.exports = function(templateName, data, allDone) {
  if (templateName) {
    fs.readFile(path.join(this.settings.app.views.path, templateName), (err, fileContent) => {
      if (err) {
        return allDone(err);
      }
      return allDone(null, handlebars.compile(fileContent.toString())(data));
    });
  }
  return allDone(null, false);
};
