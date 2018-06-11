'use strict';
const path = require('path');
const juice = require('juice');

module.exports = async function(templateName, data) {
  if (templateName) {
    const templatePath = path.join(templateName, 'email.njk');
    let compiledResult = await this.render(templatePath, data);
    if (data.inlineCss) {
      compiledResult = juice(compiledResult);
    }
    return compiledResult;
  }
  return false;
};
