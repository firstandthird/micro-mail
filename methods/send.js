'use strict';
// this method uses the render and email methods to build and
// send an email
const async = require('async');

module.exports = {
  method(opts, config, allDone) {
    // render:
    async.auto({
      render: (done) => {
        // if 'text' type is requested then we don't need to render:
        if (opts.text && opts.text !== '') {
          return done(null, {
            subject: opts.subject,
            html: opts.text
          });
        }
        // otherwise we'll render the requested template:
        this.methods.render(opts.template, opts.data, config, done);
      },
      send: ['render', (result, done) => {
        result.render.from = opts.from;
        result.render.to = opts.to;
        this.methods.email(result.render, done);
      }]
    }, allDone);
  }
};
