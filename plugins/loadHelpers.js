'use strict';

const fs = require('fs');

const register = function(server, options) {
  server.ext({
    type: 'onPostStart',
    method(serv) {
      const tmplPath = server.settings.app.templatePath;
      const viewManager = server.realm.parent.plugins.vision.manager;
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
        return viewManager.registerHelper(prop, fn);
      });

      viewManager.registerHelper('opts', name => {
        if (options[name]) {
          return options[name];
        }

        return '';
      });
    }
  });
};


exports.plugin = {
  name: 'helpers',
  once: true,
  pkg: require('../package.json'),
  register
};
