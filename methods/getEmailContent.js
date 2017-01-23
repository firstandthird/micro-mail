module.exports = function(template, emailData, allDone) {
  const server = this;
  if (emailData.template) {
    return server.render(`${emailData.template}/email`, emailData.data, allDone);
  }
  return allDone(null, false);
};
