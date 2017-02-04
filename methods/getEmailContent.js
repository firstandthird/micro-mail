'use strict';
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const juice = require('juice');

module.exports = function(templateName, data, allDone) {
  if (templateName) {
    const templatePath = path.join(this.settings.app.views.path, templateName, 'email.html');
    fs.readFile(templatePath, (err, fileContent) => {
      if (err) {
        return allDone(err);
      }
      if (data.inlineCss) {
        return allDone(null, juice(handlebars.compile(fileContent.toString())(data)));
      }
      return allDone(null, handlebars.compile(fileContent.toString())(data));
    });
  } else {
    return allDone(null, false);
  }
};
