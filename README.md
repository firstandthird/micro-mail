## Micro Mail

An app for sending emails.

### Setup

Clone this repo and `npm install`. In order to work, the rendering engine must be able to find all of your templates. Currently all template files are defaulted to exist in `./templates`. Any additional helpers can be installed in `./helpers`. See below.

```
./micro-mail
+ -- templates
|    + -- emails
|    |    + -- template-folder
|    |    |    + -- index.html
|    |    |    + -- details.yaml
|    |    |    + -- test.json
|    + -- partials
|    |    + -- header.html
|    |    + -- footer.html (Example files)
+ -- helpers
|    + -- inline.js
|    + -- example.js
```

Additionaly, you can configure where you want the files to reside in `conf/default.yaml` or in an environment specific file similar to `conf/dev.yaml` or `conf/stage.yaml`.

### API

`POST /send`

Payload:

```
{
  to: [*String],
  from: [String],
  fromName: [String],
  subject: [String],
  template: [*String],
  data: [Object],
  text: [*String],
  headers: [Object]
}
```

Attribute | Req. | Description
--- | --- | ---
**to** | *yes* | The email address of the recipient.
**from** | *no* | The email address of the sender. Overrides configured sender.
**fromName** | *no* | The common name of the sender. Override the configured name.
**subject** | *no* | The subject line of the email. Overrides the subject in the template configuration.
**template** | *yes* | The slug of the template you wish to render and send. Required if `text` is empty.
**data** | *no* | Data object that is passed to the template rendering engine. Not specifically required unless your email template requires it to render properly.
**text** | *yes* | Content to be sent as a text based email. If set, a text based email will be send regardless of the value of `template`.
**headers** | *no* | Additional headers that are sent to the email delivery agent.


Response

```
{
  status: [String (ok|error)],
  message: [String],
  result: [String|Object]
}
```

Attribute | Description
--- | --- | ---
`status` | An enumeration of the request status. `ok` for a successful transaction, and `error` if there was an error. The HTTP status code will also reflect this status (`200` for `ok`, `4**`, `5**` for error)
`message` | A Pretty message from the system.
`result` | A proxy result from the mailing system. I.E. response from the Mandrill API.

-----

`POST /cache`

The `/cache` endpoint is responsible for dealing with the template cache. You can either `clear`, `prime` or get the `status` of the cache. 

Payload:

```
{
  action: [*String (clear|prime|status)]
}
```

Attribute | Req. | Description
--- | --- | ---
**action** | *yes* | The cache action. `cache` will clear the cache. `prime` will rebuild any template cache's that are empty. `status` will return the current status of the template caches but will not perform any actions.

Response

```
{
  status: [String (ok|error)],
  message: [String],
  data: [Array]
}
```

Attribute | Description
--- | ---
`status` | An enumeration of the request status.
`message` | A pretty message from the system.
`data` | An array of objects returned from the `status` action. Will only appear in the `status` action.


