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
      const compiledResult = handlebars.compile(fileContent.toString())(data);
      if (data.inlineCss) {
        return allDone(null, juice(compiledResult));
      }
      return allDone(null, compiledResult);
    });
  } else {
    return allDone(null, false);
  }
};
