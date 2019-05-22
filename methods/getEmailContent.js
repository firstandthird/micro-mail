'use strict';
const path = require('path');
const juice = require('juice');

module.exports = async function(templateName, data) {
  const server = this;
  server.log(['info', 'getEmailContent'], { templateName });
  if (templateName) {
    const templatePath = path.join(templateName, 'email.njk');
    server.log(['info', 'getEmailContent'], { templatePath });
    let compiledResult = await this.render(templatePath, data);
    server.log(['info', 'getEmailContent'], { compiledResult });
    if (data.inlineCss) {
      compiledResult = juice(compiledResult);
    }

    server.log(['info', 'getEmailContent'], { juiced: compiledResult });
    return compiledResult;
  }
  return false;
};
