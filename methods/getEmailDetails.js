const yamljs = require('yamljs');
const async = require('async');
const varson = require('varson');
const aug = require('aug');

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
    details(emailDefaults, templateDefaults, done) {
      const rawDetails = aug('deep', emailDefaults, templateDefaults, payload);
      const details = varson(rawDetails);
      done(null, details);
    }
  }, (err, results) => {
    allDone(err, results ? results.details : null);
  });
};