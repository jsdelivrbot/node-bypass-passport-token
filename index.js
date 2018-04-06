var express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')
const session = require('express-session')


const app = express();
app.enable('trust proxy');


app.set('port', (process.env.PORT || 5000))

const cookieExpirationDate = new Date();
const cookieExpirationDays = 1;
cookieExpirationDate.setDate(cookieExpirationDate.getDate() + cookieExpirationDays);

app.use(bodyParser.urlencoded({
  extended: false
}))

require('./authentication').init(app)
ipListController = require('./public/ip-list');
list = ipListController.getIPList();


app.use(session({
  secret: 'asdf33g4w4hghjkuil8saef345', // must match with the secret for cookie-parser
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: cookieExpirationDate // use expires instead of maxAge
  }
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(function (req, res, next) {
  let requestIP = null,
    isAuthorized = false;

  requestIP = req.ip;
  if (requestIP.substr(0, 7) == "::ffff:") {
    requestIP = requestIP.substr(7)
  }

  list.forEach(ip => {
    if (ip === requestIP) {
      isAuthorized = true;
    }
  });

  if (!isAuthorized) { // Wrong IP address
    res.status(401);
    return res.send('Permission denied');
  } else {
    allowUser(req, res, next)
  }
});

function allowUser(req, res, next) {
  let user = {
    username: 'admin',
    password: 'admin'
  }
  req.query = user;
  passport.authenticate('local', (err, user, info) => {
    if (err) { console.log('Error info: ', info); }
    else if (!user) { console.log('User not found: ', info) }
    else { console.log('User activated') }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      next();
    });
  })(req, res, next)
}


app.get('/', passport.authenticationMiddleware(), (request, response) => {
  response.send('authorized user logged in');
})


app.listen(app.get('port'), () => {
  console.log("Node app is running at localhost:" + app.get('port'))
})
