module.exports = function(mailObj, done) {
  const server = this;
  server.transport.sendMail(mailObj, done);
};
