exports.send = {
  path: '/send',
  method: 'POST',
  handler(request, reply) {
    const testPath = `${request.server.settings.app.views.path}/${request.payload.template}/test.json`;
    if (request.query.test) {
      request.payload.data = require(testPath);
    }
    request.server.sendEmail(request.payload, (err, results) => {
      if (err) {
        request.server.log(['error', 'send'], { err });
        return reply({
          status: 'error',
          message: 'There has been an error', // Default message for MVP
          result: err
        }).code(500);
      }

      return reply({
        status: 'ok',
        message: 'Email delivered.',
        result: results
      });
    });
  }
};

