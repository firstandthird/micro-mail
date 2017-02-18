'use strict';
const path = require('path');
const juice = require('juice');

module.exports = function(templateName, data, allDone) {
  if (templateName) {
    const templatePath = path.join(templateName, 'email.html');
    this.root.render(templatePath, data, (renderErr, compiledResult) => {
      if (renderErr) {
        return allDone(renderErr);
      }
      if (data.inlineCss) {
        compiledResult = juice(compiledResult);
      }
      return allDone(null, compiledResult);
    });
  } else {
    return allDone(null, false);
  }
};
