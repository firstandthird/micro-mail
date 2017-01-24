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
    mailObj.html = content[0];
  }
  if (details.headers) {
    mailObj.headers = details.headers;
  }
  return allDone(null, mailObj);
};
