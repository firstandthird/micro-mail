'use strict';

const yamljs = require('yamljs');
const handlebars = require('handlebars');
const juice = require('juice');
const _ = require('lodash');

module.exports = function(payload) {
  const server = this;

  const template = payload.template || null;
  const data = payload.data || {};

  const defaultDetails = (server.settings.app.emails && server.settings.app.emails.defaultDetails) ? server.settings.app.emails.defaultDetails : {};
  const templateDir = `${server.settings.app.views.path}/${template}`;
  let emailDetails = {};

  if (template !== null) {
    try {
      emailDetails = yamljs.load(`${templateDir}/details.yaml`);
    } catch (e) {
      // Do nothing, continue
    }
  }

  const finalDetails = _.defaults({}, payload, emailDetails, defaultDetails);

  const renderedDetails = _.reduce(finalDetails, (result, value, key) => {
    if (['to', 'template', 'data', 'text', 'headers', 'inlineCss'].indexOf(key) > -1) {
      result[key] = value;
      if (payload.inlineCss && (key === 'template' || key === 'text')) {
        result[key] = juice(result[key]);
      }
      return result;
    }
    const tmpl = handlebars.compile(value);
    result[key] = tmpl(data);
    return result;
  }, {});
  return renderedDetails;
};
