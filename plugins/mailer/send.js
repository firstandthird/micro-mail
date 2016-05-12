'use strict';
const async = require('async');
module.exports = function(server, transporter, emailData, allDone) {
  async.auto({
    content: (done) => {
      if (emailData.template) {
        server.render(`${emailData.template}/email`, emailData.data, done);
      }
    },
    mailObj: ['content', (results, done) => {
      const mailObj = {
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        html: results.content[0]
      };
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
