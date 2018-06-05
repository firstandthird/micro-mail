'use strict';

const fs = require('fs');

exports.register = function(server, options, next) {
  server.ext({
    type: 'onPostStart',
    method(serv, done) {
      const tmplPath = server.settings.app.templatePath;
      const viewManager = serv.root.realm.plugins.vision.manager;
      const helpers = require('require-all')(`${__dirname}/helpers`);
      let templHelpers = {};
      try {
        if (fs.statSync(`${tmplPath}/helpers`).isDirectory()) {
          templHelpers = require('require-all')(`${tmplPath}/helpers`);
        }
      } catch (e) {
        // continue
      }

      const allHelpers = Object.assign({}, helpers, templHelpers);

      Object.keys(allHelpers).forEach(prop => {
        const fn = allHelpers[prop];
        viewManager.registerHelper(prop, fn);
      });

      viewManager.registerHelper('opts', name => {
        if (options[name]) {
          return options[name];
        }

        return '';
      });

      done();
    }
  });

  next();
};

exports.register.attributes = {
  name: 'app-helpers'
};
