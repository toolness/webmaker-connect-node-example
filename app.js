var fs = require('fs');
var crypto = require('crypto');
var Mustache = require('mustache');
var express = require('express');
var clientSessions = require('client-sessions');
var OAuth = require('oauth').OAuth;

var PORT = process.env.PORT || 8000;
var COOKIE_SECRET = process.env.COOKIE_SECRET ||
                    crypto.randomBytes(128).toString('hex');
var ORIGIN = process.env.ORIGIN || 'http://127.0.0.1:' + PORT;
var WMCONNECT_ORIGIN = process.env.WMCONNECT_ORIGIN ||
                       'https://webmaker-connect.herokuapp.com';
var MISSING_ENV_VARS = ['API_KEY', 'API_SECRET'].filter(function(name) {
  return !process.env[name];
});

var app = express();

function oauthClient(req) {
  return new OAuth(
    WMCONNECT_ORIGIN + '/api/oauth/request_token',
    WMCONNECT_ORIGIN + '/api/oauth/access_token',
    process.env.API_KEY,
    process.env.API_SECRET,
    '1.0A',
    ORIGIN + '/callback',
    'HMAC-SHA1'
  );
}

if (MISSING_ENV_VARS.length) {
  console.error('Please define the following environment variable(s): ' +
                MISSING_ENV_VARS.join(', '));
  process.exit(1);
}

app.use(express.urlencoded());
app.use(clientSessions({
  cookieName: 'session',
  secret: COOKIE_SECRET,
  duration: 24 * 60 * 60 * 1000 // 1 day
}));
app.use(express.csrf());

app.get('/', function(req, res, next) {
  var html = fs.readFileSync(__dirname + '/template.html', 'utf-8');

  res.send(Mustache.render(html, {
    WMCONNECT_ORIGIN: WMCONNECT_ORIGIN,
    username: req.session.username,
    emailHash: req.session.emailHash,
    csrfToken: req.csrfToken()
  }));
});

app.post('/login', function(req, res, next) {
  oauthClient().getOAuthRequestToken(function(err, token, secret, results) {
    if (err) return next(err);
    req.session.request_token = token;
    req.session.request_token_secret = secret;
    return res.redirect(WMCONNECT_ORIGIN + '/authorize?oauth_token=' + token);
  });
});

app.get('/callback', function(req, res, next) {
  var token = req.param('oauth_token');
  var verifier = req.param('oauth_verifier');

  if (token != req.session.request_token)
    return res.send('token mismatch');

  oauthClient().getOAuthAccessToken(
    req.session.request_token,
    req.session.request_token_secret,
    verifier,
    function(err, access_token, access_token_secret, results) {
      if (err)
        return res.type('text/plain').send(util.inspect(err));
      delete req.session.request_token;
      delete req.session.request_token_secret;
      req.session.access_token = access_token;
      req.session.access_token_secret = access_token_secret;
      req.session.username = results.username;
      req.session.userId = results.userId;
      req.session.emailHash = results.emailHash;
      return res.redirect('/');
    }
  );
});

app.post('/logout', function(req, res, next) {
  req.session = {};
  return res.redirect('/');
});

app.use(express.static(__dirname + '/static'));

app.listen(PORT, function() {
  console.log('listening on port ' + PORT + ' (origin ' + ORIGIN + ')');
});
