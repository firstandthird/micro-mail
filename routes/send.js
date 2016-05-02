/*
 this route will render and transmit an email.

payload should contain:
- 'to'
- 'from'
- 'subject'
- 'template'  (the name of the template to execute)
- 'text' (will bypass the templating engine and render the enclosed text instead)
- 'refreshCache' (if set to any truthy value, will refresh the template/helper/partial caches)
*/
exports.send = {
  path: '/send',
  method: 'post',
  handler(request, reply) {
    const config = request.server.settings.app;
    request.server.methods.send(request.payload, config, (err, result) => {
      if (err) {
        reply(err);
      } else {
        reply(result);
      }
    });
  }
};
