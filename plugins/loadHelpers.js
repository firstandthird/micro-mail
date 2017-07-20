'use strict';

exports.register = function(server, options, next) {
  server.ext({
    type: 'onPostStart',
    method(serv, done) {
      const viewManager = serv.root.realm.plugins.vision.manager;
      const helpers = require('require-all')(`${__dirname}/helpers`);

      Object.keys(helpers).forEach(prop => {
        const fn = helpers[prop];
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
