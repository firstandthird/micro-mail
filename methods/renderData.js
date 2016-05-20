'use strict';

const yamljs = require('yamljs');
const handlebars = require('handlebars');
const _ = require('lodash');

module.exports = function(payload) {
  const server = this;

  const template = payload.template || null;
  const data = payload.data || {};

  const defaultDetails = server.settings.app.emails.defaultDetails || {};
  const templateDir = `${server.settings.app.templatePath}/${template}`;
  let emailDetails = {};

  if (template !== null) {
    emailDetails = yamljs.load(`${templateDir}/details.yaml`);
  }

  const finalDetails = _.defaults({}, payload, emailDetails, defaultDetails);

  const renderedDetails = _.reduce(finalDetails, (result, value, key) => {
    if (['to', 'template', 'data', 'text', 'headers'].indexOf(key) !== -1) {
      result[key] = value;
      return result;
    }

    const tmpl = handlebars.compile(value);
    result[key] = tmpl(data);
    return result;
  }, {});

  return renderedDetails;
};
