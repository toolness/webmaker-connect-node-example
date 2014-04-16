# Webmaker Connect Node Example App

This is a very simple [OAuth][] consumer that uses [Webmaker Connect][] to
access information and services related to a user's Webmaker account.

## Prerequisites

Node 0.10.

## Quick Start

First visit the [Webmaker Connect][] site to create an app for yourself.
You'll need your app's API key and secret below.

```
git clone git://github.com/toolness/webmaker-connect-node-example.git
cd webmaker-connect-node-example
npm install
export API_KEY='YOUR API KEY GOES HERE'
export API_SECRET='YOUR API SECRET GOES HERE'
node app.js
```

Then visit http://127.0.0.1:8000 and try logging in.

## Environment Variables

* `PORT` is the port that the server binds to. Defaults to 8000.

* `COOKIE_SECRET` is the secret used to encrypt and sign cookies,
  to prevent tampering. By default, it will be set to a random value;
  the downside of this default is that every time you restart the server,
  any existing cookies will be invalid, since `COOKIE_SECRET` will have
  changed. And if you actually want to deploy this app and have it scale
  across multiple processes, you'll definitely want to define this,
  so that every process uses the same key.

* `ORIGIN` is the origin of the server, as it appears
  to users. It defaults to `http://127.0.0.1:PORT`.

* `WMCONNECT_ORIGIN` is the origin of the Webmaker Connect server,
  which defaults to https://webmaker-connect.herokuapp.com.

* `API_KEY` is the OAuth consumer key for your app. You can get it by
  creating a new app on the Webmaker Connect site.

* `API_SECRET` is the OAuth consumer secret for your app. You can get it
  by creating a new app on the Webmaker Connect site.

## Troubleshooting

If you're running the Webmaker Connect server locally, make sure it uses
a different hostname than this server; otherwise, cookie sessions between
the two servers will collide and overwrite each other. This is why
this server uses `127.0.0.1` in its default origin, while the Webmaker
Connect development server uses `localhost`.

  [OAuth]: http://oauth.net/
  [Webmaker Connect]: https://webmakerconnect.org
