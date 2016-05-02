'use strict';
const handlebars = require('handlebars');
const fs = require('fs');
const async = require('async');
const yamlParser = require('js-yaml');
const Logr = require('logr');
const log = new Logr({
  defaultTags: ['handler'],
  type: 'console'
});
const path = require('path');

const GlobalTemplateCache = {};
let partialsCached = false;
let helpersCached = false;

const loadPartials = (config, done) => {
  if (config.folders) {
    async.each(fs.readdirSync(`./${config.folders.partials}`),
     (partialFileName, callback) => {
       handlebars.registerPartial(path.basename(partialFileName, '.html'),
        fs.readFileSync(`./${config.folders.partials}/${partialFileName}`, 'utf-8'));
       callback();
     }, (err) => {
       done(err);
     });
  } else {
    //todo: option to load from web dirs, s3, etc
  }
  partialsCached = true;
};

const loadHelpers = (config, done) => {
  if (config.folders) {
    async.each(fs.readdirSync(`./${config.folders.helpers}`), (helperFileName, callback) => {
      handlebars.registerHelper(path.basename(helperFileName, '.html'),
        fs.readFileSync(helperFileName, 'utf-8'));
      callback();
    }, (err) => {
      done(err);
    });
  } else {
    //todo: option to load from s3
  }
  helpersCached = true;
};

const loadTemplateFromFile = (templateName, config, done) => {
  log([], templateName);
  const fileContents = fs.readFileSync(`./${config.folders.templates}/${templateName}/email.html`, 'utf-8');
  console.log("getting details!");
  const details = yamlParser.safeLoad(fs.readFileSync(`./${config.folders.templates}/${templateName}/details.yaml`, 'utf-8'));
  console.log(details)
  GlobalTemplateCache[templateName] = {
    html: fileContents,
    details,
    render: handlebars.compile(fileContents)
  };
  done(null, GlobalTemplateCache[templateName]);
};

const getTemplate = (templateName, config, done) => {
  if (config.folders) {
    loadTemplateFromFile(templateName, config, done);
  } // todo: else if (config.s3)
};

module.exports = {
  method(templateName, data, config, allDone) {
    // build up a sequence of functions needed to
    // load all the components of a handlebars template:
    const executionSequence = {
      template: (done) => {
        try {
          if (!GlobalTemplateCache[templateName] || data.refreshCache) {
            return getTemplate(templateName, config, done);
          }
          done(null, GlobalTemplateCache[templateName]);
        } catch (exc) {
          done(exc);
        }
      }
    };
    if (!partialsCached || data.refreshCache) {
      executionSequence.partials = (done) => {
        try {
          loadPartials(config, done);
        } catch (exc) {
          done(exc);
        }
      };
    }
    if (!helpersCached || data.refreshCache) {
      executionSequence.helpers = (done) => {
        try {
          loadHelpers(config, done);
        } catch (exc) {
          done(exc);
        }
      };
    }
    // now call the sequence of functions:
    async.auto(executionSequence, (err, results) => {
      if (err) {
        log(['email'], { error: err });
      } else {
        log([], results);
      }
      allDone(err, results.template);
    });
  }
};
