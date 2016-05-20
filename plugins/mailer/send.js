'use strict';

const yamljs = require('yamljs');
const handlebars = require('handlebars');
const _ = require('lodash');


const async = require('async');
module.exports = function(server, transporter, emailData, allDone) {
  async.auto({
    details: (done) => {
      const template = emailData.template || null;
      const data = emailData.data || {};

      const defaultDetails = server.settings.app.emails.defaultDetails || {};
      const templateDir = `${server.settings.app.templatePath}/${template}`;
      let emailDetails = {};

      if (template !== null) {
        emailDetails = yamljs.load(`${templateDir}/details.yaml`);
      }

      const finalDetails = _.defaults({}, emailData, emailDetails, defaultDetails);

      const renderedDetails = _.reduce(finalDetails, (result, value, key) => {
        if (['to', 'template', 'data', 'text', 'headers'].indexOf(key) !== -1) {
          result[key] = value;
          return result;
        }

        const tmpl = handlebars.compile(value);
        result[key] = tmpl(data);
        return result;
      }, {});

      done(renderedDetails);
    },
    content: (done) => {
      if (emailData.template) {
        return server.render(`${emailData.template}/email`, emailData.data, done);
      }

      done(null, null);
    },
    mailObj: ['content', 'details', (results, done) => {
      let from = results.details.from;
      if (results.details.fromName) {
        from = `"${results.details.fromName}" ${from}`;
      }

      const mailObj = {
        from,
        to: results.details.to,
        subject: results.details.subject,
        text: results.details.text
      };

      if (results.content) {
        mailObj.html = results.content[0];
      }

      if (results.details.headers) {
        mailObj.headers = results.details.headers;
      }

      done(null, mailObj);
    }],
    send: ['mailObj', (results, done) => {
      transporter.sendMail(results.mailObj, done);
    }]
  }, (err, results) => {
    if (err) {
      return allDone(err);
    }
    allDone(null, results.send);
  });
};
