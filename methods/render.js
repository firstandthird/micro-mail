'use strict';
const handlebars = require('handlebars');

const renderTemplate = (template, data) => {
  console.log("*&&&&&&&&&&&&&&&&&&")
  console.log(_.merge(template.details, data));
  return template.render(_.merge(template.details(data)));
};

const renderString = (string, data) => {
  return handlebars.compile(string)(data);
};

module.exports = {
  method(mailObj, data, allDone) {
    try {
      if (typeof mailObj.html === 'string') {
        mailObj.html = renderString(mailObj.html, data);
      } else {
        mailObj.html = renderTemplate(mailObj.html, data);
      }
      mailObj.subject = renderString(mailObj.subject, data);
      allDone(null, mailObj);
    } catch (exc) {
      allDone(exc);
    }
  }
};
