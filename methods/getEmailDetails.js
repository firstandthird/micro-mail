'use strict';

const yamljs = require('yamljs');
const async = require('async');
const varson = require('varson');
const aug = require('aug');
const _ = require('lodash');

module.exports = function(payload, allDone) {
  const server = this;
  const settings = server.settings.app;
  const template = payload.template || null;
  const templateDir = `${settings.views.path}/${template}`;

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
      if (!template) {
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
    dataDefaults(done) {
      if (server.methods.pageData) {
        const pageDataSettings = settings.plugins['hapi-pagedata'];
        server.methods.pageData.set(pageDataSettings.site, {
          getEmailDetails1: {
            tags: [pageDataSettings.tag]
          },
        }, (err, res) => {
          return server.methods.pageData.get(pageDataSettings.site, template, pageDataSettings.tag, done);
        });
      }
      return done(null, {});
    },
    details(emailDefaults, templateDefaults, dataDefaults, done) {
      console.log('so i got back');
      console.log('so i got back');
      console.log('so i got back');
      console.log(dataDefaults);
      const rawDetails = aug('deep', emailDefaults, templateDefaults, dataDefaults, payload);
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
      console.log('so that was an error:')
      console.log(err)
    }
    allDone(err, results ? results.details : null);
  });
};
