'use strict';

const viewTemplate = function(mailObj, data) {
  const html = `
    <div><strong>Subject:</strong> ${mailObj.subject}</div>
    <div><strong>From:</strong> ${mailObj.from.replace('<', '&lt;').replace('>', '&gt;')}</div>
    <div><strong>To:</strong> ${mailObj.to}</div>
    <div><strong>Headers:</strong> ${mailObj.headers || ''}</div>
    <div><strong>Data:</strong> ${JSON.stringify(data)}</div>
    <hr/>
    <div>
      ${mailObj.html}
    </div>
  `;
  return html;
};

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
          data: require(testPath),
          to: 'test@firstandthird.com'
        };
        done(null, payload);
      },
      details(server, payload, done) {
        server.methods.getEmailDetails(payload, done);
      },
      content(server, details, done) {
        server.methods.getEmailContent(details.template, details.data, done);
      },
      mailObj(server, details, content, done) {
        server.methods.getMailObject(details, content, done);
      },
      tmpl(mailObj, details, done) {
        done(null, viewTemplate(mailObj, details.data));
      },
      reply(request, details, tmpl, done) {
        if (request.query.json) {
          return done(null, details);
        }
        done(null, tmpl);
      }
    }
  }
};

exports.viewPagedata = {
  path: '/view/pagedata/{slug}',
  method: 'GET',
  handler: {
    autoInject: {
      payload(server, request, done) {
        const slug = request.params.slug;
        const payload = {
          pagedata: {
            slug
          },
          to: 'test@firstandthird.com'
        };
        done(null, payload);
      },
      details(server, payload, done) {
        server.methods.getEmailDetails(payload, { useExampleData: true }, done);
      },
      content(server, details, done) {
        server.methods.getEmailContent(details.template, details.data, done);
      },
      mailObj(server, details, content, done) {
        server.methods.getMailObject(details, content, done);
      },
      tmpl(mailObj, details, done) {
        done(null, viewTemplate(mailObj, details.data));
      },
      reply(request, details, tmpl, done) {
        if (request.query.json) {
          return done(null, details);
        }
        done(null, tmpl);
      }
    }
  }
};
