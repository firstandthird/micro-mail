'use strict';
const Joi = require('joi');

const schema = Joi.object().keys({
  from: Joi.string().required(),
  to: Joi.alternatives().try(Joi.string(), Joi.array()).required(),
  subject: Joi.string(),
  headers: Joi.optional(),
  html: Joi.optional(),
  text: Joi.optional()
});
module.exports = function(details, content, allDone) {
  let from = details.from;
  if (details.fromName) {
    from = `"${details.fromName}" <${from}>`;
  }
  const mailObj = {
    from,
    to: details.to,
    subject: details.subject,
    text: details.text
  };
  if (content) {
    mailObj.html = content;
  }
  if (details.headers) {
    mailObj.headers = details.headers;
  }
  Joi.validate(mailObj, schema, (validationErr) => {
    if (validationErr) {
      return allDone(validationErr);
    }
    return allDone(null, mailObj);
  });
};
