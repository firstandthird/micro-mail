'use strict';

const yamljs = require('yamljs');
const async = require('async');
const varson = require('varson');
const aug = require('aug');
module.exports = function(payload, allDone) {
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
      const pagedata = aug({}, emailDefaults.pagedata, templateDefaults.pagedata, payload.pagedata);
      if (pagedata.slug) {
        return server.methods.pagedata.getPageContent(pagedata.slug, pagedata.tag, (err, data) => {
          if (err) {
            return done(err);
          }
          done(null, data);
        });
      }
      return done(null, {});
    },
    details(emailDefaults, templateDefaults, pagedata, done) {
      const rawDetails = aug('deep', {}, emailDefaults, templateDefaults, pagedata, payload);
      const details = varson(rawDetails);
      done(null, details);
    },
    validate(details, done) {
      const keys = Object.keys(details.data);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (details.data[key] === undefined || details.data[key] === '') {
          return done(new Error(`data field field ${key} is empty`));
        }
      }
      return done(null, details);
    }
  }, (err, results) => {
    if (err) {
      return allDone(err);
    }
    allDone(null, results ? results.details : null);
  });
};
