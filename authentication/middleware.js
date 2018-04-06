function authenticationMiddleware () {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.send('unauthorized user',401);
  }
}

module.exports = authenticationMiddleware
