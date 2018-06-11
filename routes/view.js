const obj2html = function(obj) {
  if (!obj) {
    return '';
  }
  const html = [];
  Object.keys(obj).forEach((key) => {
    html.push(`${key}: ${obj[key]}`);
  });
  return html.join(', ');
};

const viewTemplate = function(mailObj, data) {
  const html = `
    <html>
      <head>
        <title>${mailObj.subject}</title>
      </head>
      <body>
        <div class="container" style="margin:auto;width:800px;">
          ${mailObj.html}
        </div>
      </body>
    </html>
  `;
  return html;
};

exports.view = {
  path: '/view/{email}',
  method: 'GET',
  async handler (request, h) {
    const server = request.server;
    const email = request.params.email;
    const payload = {
      template: email,
      data: request.query,
      to: 'test@firstandthird.com',
      disableTracking: true
    };
    const details = await server.methods.getEmailDetails(payload);
    const content = await server.methods.getEmailContent(details.template, details.data);
    const mailObj = await server.methods.getMailObject(details, content);
    const tmpl = viewTemplate(mailObj, details.data);
    if (request.query.json) {
      return details;
    }
    return tmpl;
  }
};

const testViewTemplate = function(mailObj, data) {
  const html = `
    <div><strong>Subject:</strong> ${mailObj.subject}</div>
    <div><strong>From:</strong> ${mailObj.from.replace('<', '&lt;').replace('>', '&gt;')}</div>
    <div><strong>To:</strong> ${mailObj.to}</div>
    <div><strong>Headers:</strong> ${obj2html(mailObj.headers)}</div>
    <div><strong>Data:</strong> ${obj2html(data)}</div>
    <hr/>
    <div>
      ${mailObj.html}
    </div>
  `;
  return html;
};

exports.testView = {
  path: '/view/test/{email}',
  method: 'GET',
  async handler(request, h) {
    const server = request.server;
    const email = request.params.email;
    const testPath = `${server.settings.app.views.path}/${email}/test.json`;
    const disableTracking = (request.query.disableTracking !== 'false');
    const payload = {
      template: email,
      data: require(testPath),
      to: 'test@firstandthird.com',
      disableTracking
    };
    const details = await server.methods.getEmailDetails(payload);
    const content = await server.methods.getEmailContent(details.template, details.data);
    const mailObj = await server.methods.getMailObject(details, content);
    const tmpl = testViewTemplate(mailObj, details.data);
    if (request.query.json) {
      return details;
    }
    return tmpl;
  }
};

exports.viewPagedata = {
  path: '/view/pagedata/{slug}',
  method: 'GET',
  async handler(request, h) {
    const server = request.server;
    const slug = request.params.slug;
    const payload = {
      pagedata: slug,
      to: 'test@firstandthird.com',
      disableTracking: true
    };
    const details = await server.methods.getEmailDetails(payload);
    const content = await server.methods.getEmailContent(details.template, details.data);
    const mailObj = await server.methods.getMailObject(details, content);
    const tmpl = viewTemplate(mailObj, details.data);
    if (request.query.json) {
      return details;
    }
    return tmpl;
  }
};
