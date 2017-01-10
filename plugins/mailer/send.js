'use strict';

const async = require('async');
const omit = require('lodash.omit');

module.exports = function(server, transporter, allData, debug, sendIndividual, allDone) {
  const sendOne = (emailData, sendDone) => {
    async.auto({
      details: (done) => {
        done(null, server.methods.renderData(emailData));
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
          from = `"${results.details.fromName}" <${from}>`;
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
        server.log(['error', 'send'], { err });
        return sendDone(err, {
          status: 'error',
          message: 'There has been an error', // Default message for MVP
          result: err
        });
      }
      return sendDone(null, {
        status: 'ok',
        message: 'Email delivered.',
        result: results.send
      });
    });
  };
  if (sendIndividual) {
    const toList = allData.to.split(',');
    const allResults = [];
    let allSucceeded = true;
    async.each(toList, (item, done) => {
      const curPayload = omit(allData, 'to');
      curPayload.to = item.trim();
      sendOne(curPayload, (err, result) => {
        if (err) {
          allSucceeded = false;
        }
        allResults.push(result.result);
        done();
      });
    }, (err) => {
      if (err) {
        return allDone(err, allResults);
      }
      return allDone(!allSucceeded, allResults);
    });
  } else {
    sendOne(allData, allDone);
  }
};
