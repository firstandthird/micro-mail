'use strict';

const handlebars = require('handlebars');

module.exports = function(template, data, allDone) {
  if (template) {
    return allDone(null, handlebars.compile(template.toString())(data));
  }
  return allDone(null, false);
};
