## Micro Mail

An app for sending emails.


# API

`/send`

Payload:

The Payload to send an email consists of the following attributes:

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
