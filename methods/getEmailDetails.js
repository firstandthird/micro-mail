'use strict';

const yamljs = require('yamljs');
const async = require('async');
const varson = require('varson');
const aug = require('aug');
const uuid = require('node-uuid');

module.exports = function(payload, options, allDone) {
  if (typeof options === 'function') {
    allDone = options;
    options = {};
  }
  const server = this;
  const settings = server.settings.app;
  const templateName = payload.template || null;
  const templateDir = `${settings.views.path}/${templateName}`;

  async.autoInject({
    emailDefaults(done) {
      let defaults;
      try {
        defaults = yamljs.load(`${settings.views.path}/defaults.yaml`);
      } catch (e) {
        defaults = {};
      }
      done(null, defaults);
    },
    templateDefaults(done) {
      if (!templateName) {
        return done(null, {});
      }

      let emailDetails;
      try {
        emailDetails = yamljs.load(`${templateDir}/details.yaml`);
      } catch (e) {
        emailDetails = {};
      }
      done(null, emailDetails);
    },
    pagedata(emailDefaults, templateDefaults, done) {
      const defaults = aug({}, emailDefaults, templateDefaults, payload);
      const pagedata = defaults.pagedata;
      if (pagedata) {
        return server.methods.pagedata.getPageContent(pagedata, (err, data) => {
          if (err) {
            return done(err);
          }
          done(null, data);
        });
      }
      return done(null, {});
    },
    exampleData(pagedata, done) {
      if (options.useExampleData && pagedata.example) {
        return done(null, { data: pagedata.example });
      }
      done(null, {});
    },
    details(emailDefaults, templateDefaults, pagedata, exampleData, done) {
      const rawDetails = aug('deep', {}, emailDefaults, templateDefaults, pagedata, payload, exampleData);
      //set this just in case no data is passed
      if (!rawDetails.data) {
        rawDetails.data = {};
      }
      if (!rawDetails.disableTracking) {
        rawDetails.uuid = uuid.v4();
      }

      const details = varson(rawDetails);
      done(null, details);
    },
    trackingData(details, done) {
      if (!details.disableTracking && settings.enableMetrics) {
        const tagPayload = (details.trackingData) ? details.trackingData.tags : {};
        let tags = `template:${details.template}`;
        Object.keys(tagPayload).forEach(key => {
          tags = `${tags},${key}:${tagPayload[key]}`;
        });
        if (details.pagedata && details.pagedata.slug) {
          tags = `${tags},pagedataSlug:${details.pagedata.slug}`;
        }

        details.data.trackingPixel = `<img src="${settings.ENV.MICRO_METRICS_HOST}t.gif?type=email.open&value=1&tags=${tags}&fields=toEmail:${details.to},uuid:${details.uuid}"></img>`;
      }
      delete details.disableTracking; // no need to pass back
      done(null);
    },
    validate(trackingData, details, done) {
      if (!details.requiredData) {
        return done();
      }

      const errors = [];
      details.requiredData.forEach((key) => {
        if (!details.data[key]) {
          errors.push(key);
        }
      });
      if (errors.length !== 0) {
        return done(new Error(`missing data for ${errors.join(',')}`));
      }
      done();
    }
  }, (err, results) => {
    if (err) {
      return allDone(err);
    }
    allDone(null, results ? results.details : null);
  });
};
