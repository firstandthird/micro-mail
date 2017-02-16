'use strict';

module.exports = function(templateName, data, allDone) {
  if (templateName) {
    return this.methods.renderEmailTemplate(templateName, data, allDone);
  }
  return allDone(null, false);
};
