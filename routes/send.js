/*
payload contains:
- 'to'
- 'from'
- 'subject'
- 'template'  (the name of the template)
- 'text' (will bypass the templating engine and send the enclosed text instead)
- 'refreshCache' (optional, set this to the literal word 'refresh' to reset the template cache)
*/
exports.send = {
  path: '/send',
  method: 'post',
  handler(request, reply) {
    //todo: hapi-confi not loading the config right, needs to be fixed:
    const config = request.server.settings.app;
    request.server.methods.send(request.payload, config, (err, result) => {
      if (err) {
        console.log(err);
        reply(err);
      } else {
        reply(result);
      }
    });
  }
};
