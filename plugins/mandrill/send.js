'use strict';
const async = require('async');
module.exports = function(server, mandrill, emailData, allDone) {
  async.auto({
    content: (done) => {
      if (emailData.template) {
        return server.render(`${emailData.template}/email`, emailData.data, done);
      }

      done(null, null);
    },
    mailObj: ['content', (results, done) => {
      const htmlContent = (results.content) ? results.content[0] : null;

      const mailObj = {
        html: htmlContent,
        text: emailData.text,
        from_email: emailData.from,
        from_name: emailData.fromName,
        to: [{ email: emailData.to }],
        subject: emailData.subject,
        headers: emailData.headers,
        inline_css: true,
        track_clicks: true,
        track_opens: true,
        tags: [emailData.template]
      };

      if (mailObj.html === null) {
        mailObj.track_clicks = false;
        mailObj.track_opens = false;
      }

      done(null, mailObj);
    }],
    send: ['mailObj', (results, done) => {
      mandrill.messages.send({ message: results.mailObj, async: true }, (response) => {
        if (response[0].status !== 'sent') {
          return done({ message: response[0].reject_reason, response: response[0] });
        }

        done(null, response[0]);
      });
    }]
  }, allDone);
};
