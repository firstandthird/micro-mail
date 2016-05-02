'use strict';
const async = require('async');

// this method uses the getTemplate, render, and email methods to build and
// transmit your email:
module.exports = {
  method(opts, config, allDone) {
    async.auto({
      // get the object that will be mailed:
      mailObj: (done) => {
        // if 'text' type is requested then we just render the text and return:
        if (opts.text || opts.text === '') {
          return done(null, {
            from: opts.from,
            to: opts.to,
            subject: opts.subject,
            html: opts.text
          });
        }
        this.methods.getTemplate(opts.template, opts.data, config, (err, template) => {
          if (err) {
            return done(err);
          }
          done(null, {
            from: opts.from,
            to: opts.to,
            subject: opts.subject,
            html: template
          });
        });
      },
      // do all template rendering:
      render: ['mailObj', (result, done) => {
        this.methods.render(result.mailObj, opts.data, done);
      }],
      // send the email:
      send: ['render', (result, done) => {
        this.methods.email(result.render, done);
      }]
    }, allDone);
  }
};
