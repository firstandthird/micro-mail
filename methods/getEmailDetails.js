'use strict';

const yamljs = require('yamljs');
const varson = require('varson');
const aug = require('aug');
const uuid = require('node-uuid');

module.exports = async function(payload, options) {
  if (!options) {
    options = {};
  }
  const server = this;
  const settings = server.settings.app;
  const templateName = payload.template || null;
  const templateDir = `${settings.views.path}/${templateName}`;
  let emailDefaults;
  try {
    emailDefaults = yamljs.load(`${settings.views.path}/defaults.yaml`);
  } catch (e) {
    emailDefaults = {};
  }

  let templateDefaults;
  if (!templateName) {
    templateDefaults = {};
  } else {
    try {
      templateDefaults = yamljs.load(`${templateDir}/details.yaml`);
    } catch (e) {
      templateDefaults = {};
    }
  }

  const defaults = aug(emailDefaults, templateDefaults, payload);
  let pagedata = {};
  if (defaults.pagedata) {
    const page = await server.pagedata.getPage(defaults.pagedata);
    pagedata = page.content;
  }
  let exampleData = {};
  if (options.useExampleData && pagedata.example) {
    exampleData = { data: pagedata.example };
  }

  const rawDetails = aug(emailDefaults, templateDefaults, pagedata, payload, exampleData);
  //set this just in case no data is passed
  if (!rawDetails.data) {
    rawDetails.data = {};
  }
  if (!rawDetails.disableTracking) {
    rawDetails.uuid = uuid.v4();
  }

  const details = varson(rawDetails);
  if (!details.disableTracking && settings.enableMetrics) {
    const tagPayload = (details.trackingData) ? details.trackingData.tags : {};
    let tags = `template:${details.template}`;
    Object.keys(tagPayload).forEach(key => {
      tags = `${tags},${key}:${tagPayload[key]}`;
    });
    if (details.pagedata) {
      tags = `${tags},pagedataSlug:${details.pagedata}`;
    }
    const trackTo = details.to.replace(',', '|');
    details.data.trackingPixel = `<img src="${settings.metricsHost}t.gif?type=email.open&value=1&tags=${tags}&fields=toEmail:${trackTo},uuid:${details.uuid}"></img>`;
  } else {
    details.data.disableTracking = true;
    details.data.trackingPixel = '';
  }
  delete details.disableTracking; // no need to pass back
  if (details.requiredData) {
    const errors = [];
    details.requiredData.forEach((key) => {
      if (!details.data[key]) {
        errors.push(key);
      }
    });
    if (errors.length !== 0) {
      throw new Error(`missing data for ${errors.join(',')}`);
    }
  }
  return details;
};
