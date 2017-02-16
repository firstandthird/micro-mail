'use strict';
const handlebars = require('handlebars');
const async = require('async');
const fs = require('fs');
const path = require('path');
const juice = require('juice');

exports.register = function(server, options, next) {
  console.log(options)
  async.autoInject({
    partials: (done) => {
      if (options.partialsPath) {
        return fs.readdir(options.partialsPath, (err, files) => {
          if (err) {
            console.log(err)
            server.log(['error', 'plugins.render'], err);
            return done();
          }
          async.each(files, (file, eachDone) => {
            fs.readFile(path.join(options.partialsPath, file), (readErr, data) => {
              if (readErr) {
                server.log(['error', 'plugins.render'], readErr);
                return eachDone();
              }
              handlebars.registerPartial(path.basename(file, '.html'), data.toString());
              eachDone();
            });
          }, done);
        });
      }
      return done();
    },
    helpers: (done) => {
      if (options.helpersPath) {
        return fs.readdir(options.helpersPath, (err, files) => {
          if (err) {
            console.log(err)
            server.log(['error', 'plugins.render'], err);
            return done();
          }
          files.forEach((file) => {
            console.log(`file is ${file}`)
            try {
              handlebars.registerHelper(path.basename(file, '.js'), require(path.join(options.helpersPath, file)));
            } catch (e) {
              console.log(`unable to load ${file}`)
              console.log(e)
              server.log(['error'], `error loading helper ${file}`);
            }
          });
          done();
        });
      }
      return done();
    }
  }, () => {
    server.method('renderEmailTemplate', (templateName, data, renderDone) => {
      const templatePath = path.join(server.settings.app.views.path, templateName, 'email.html');
      fs.readFile(templatePath, (templateErr, fileContent) => {
        if (templateErr) {
          return renderDone(templateErr);
        }
        let compiledResult = handlebars.compile(fileContent.toString())(data);
        if (data.inlineCss) {
          compiledResult = juice(compiledResult);
        }
        return renderDone(null, compiledResult);
      });
    });
    next();
  });
};

exports.register.attributes = {
  name: 'render'
};
