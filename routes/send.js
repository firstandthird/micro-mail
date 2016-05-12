exports.send = {
  path: '/send',
  method: 'POST',
  handler(request, reply) {
    const emailData = request.payload;
    request.server.sendEmail(emailData, reply);
  }
};

