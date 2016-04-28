// returns a simple client page you can use to test the /send route:
exports.home = {
  path: '/',
  method: 'get',
  handler(request, reply) {
    reply(`
      <html>
        <head>
          <script src=""> </script>
          $()
        </head>
        <body>
        <form action="/send" method="POST">
        To: <input id="to" name="to" type=email> <br>
        From: <input id="from" name="from" type=email> <br>
        Subject: <input id="subject" name="subject"> <br>
        Text: <input id="text" name="text"> <br>
        Template: <input id="template" name="template"> <br>
        <button> Send </button>
        </form>
        </body>
      </html>
      `);
  }
};
