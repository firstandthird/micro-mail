const handlebars = require('handlebars');
const fs = require('fs');
const async = require('async');
const Logr = require('logr');
const log = new Logr({
  defaultTags: ['handler'],
  type: 'console'
});
const path = require('path');
const GlobalTemplateCache = {};

//todo: partials and helpers should load up front:
const loadPartials = (config, done) => {
  if (config.folders) {
    async.each(fs.readdirSync(`./${config.folders.partials}`),
    (partialFileName, callback) => {
      handlebars.registerPartial(path.basename(partialFileName, '.html'),
        fs.readFileSync(
          `./${config.folders.partials}/${partialFileName}`, 'utf-8')
      );
      callback();
    }, (err) => {
      done(err);
    });
  } else {
    //todo: option to load from s3
  }
};

const loadHelpers = (config, done) => {
  if (config.folders) {
    async.each(fs.readdirSync(`./${config.folders.helpers}`), (helperFileName, callback) => {
      handlebars.registerHelper(helperFileName, fs.readFileSync(helperFileName, 'utf-8'));
      callback();
    }, (err) => {
      done(err);
    });
  } else {
    //todo: option to load from s3
  }
  done();
};

const loadTemplateFromFile = (templateName, config, done) => {
  log([], templateName);
  const fileContents = fs.readFileSync(`./${config.folders.templates}/${templateName}/email.html`, 'utf-8');
  GlobalTemplateCache[templateName] = {
    html: fileContents,
    render: handlebars.compile(fileContents)
  };
  done(null, GlobalTemplateCache[templateName]);
};

const getTemplate = (templateName, config, done) => {
  if (GlobalTemplateCache[templateName]) {
    done(null, GlobalTemplateCache[templateName]);
  } else if (config.folders) {
    loadTemplateFromFile(templateName, config, done);
  } // todo: else if (config.s3)
};

const renderTemplate = (template, config, done) => {
  done(template.render({}));
};

module.exports = {
  method(templateName, data, config, allDone) {
    async.auto({
      partials: (done) => {
        loadPartials(config, done);
      },
      helpers: (done) => {
        done();
        // loadHelpers(config, done);
      },
      template: (done) => {
        getTemplate(templateName, config, done);
      },
      render: ['template', 'partials', 'helpers', (results, done) => {
        renderTemplate(results.template, config, done);
      }]
    }, (err, results) => {
      if (err) {
        log(['email'], { error: err });
      } else {
        log([], results);
      }
      allDone(err, results.render);
    });
  }
};
