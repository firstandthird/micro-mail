'use strict';
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

module.exports = function(templateName, data, allDone) {
  if (templateName) {
    const templatePath = path.join(this.settings.app.views.path, templateName, 'email.html');
    fs.readFile(templatePath, (err, fileContent) => {
      if (err) {
        return allDone(err);
      }
      allDone(null, handlebars.compile(fileContent.toString())(data));
    });
  } else {
    return allDone(null, false);
  }
};
