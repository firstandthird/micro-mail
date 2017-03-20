'use strict';

exports.view = {
  path: '/view/{email}',
  method: 'GET',
  handler: {
    autoInject: {
      payload(server, request, done) {
        const email = request.params.email;
        const testPath = `${server.settings.app.views.path}/${email}/test.json`;
        const payload = {
          template: email,
          data: require(testPath)
        };
        done(null, payload);
      },
      details(server, payload, done) {
        server.methods.getEmailDetails(payload, done);
      },
      content(server, details, done) {
        server.methods.getEmailContent(details.template, details.data, done);
      },
      reply(request, details, content, done) {
        if (request.query.json) {
          return done(null, details);
        }
        done(null, content);
      }
    }
  }
};

exports.view = {
  path: '/view/pagedata-{slug}',
  method: 'GET',
  handler: {
    autoInject: {
      payload(server, request, done) {
        const slug = request.params.slug;
        const payload = {
          pagedata: {
            slug
          }
        };
        done(null, payload);
      },
      details(server, payload, done) {
        server.methods.getEmailDetails(payload, done);
      },
      content(server, details, done) {
        server.methods.getEmailContent(details.template, details.data, done);
      },
      reply(request, details, content, done) {
        if (request.query.json) {
          return done(null, details);
        }
        done(null, content);
      }
    }
  }
};
