exports.send = {
  path: '/send',
  method: 'POST',
  handler(request, reply) {
    // Render emailDetails
    const renderedData = request.server.methods.renderData(request.payload);
    request.server.sendEmail(renderedData, (err, results) => {
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
        result: results.send
      });
    });
  }
};

