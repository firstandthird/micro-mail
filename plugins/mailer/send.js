'use strict';
const juice = require('juice');
const async = require('async');

module.exports = function(server, transporter, emailData, allDone) {
  async.auto({
    details: (done) => {
      done(null, server.methods.renderData(emailData));
    },
    content: (done) => {
      if (emailData.template) {
        return server.render(`${emailData.template}/email`, emailData.data, (err, templateOutput) => {
          return done(err, juice(templateOutput));
        });
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
        mailObj.html = results.content;
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
