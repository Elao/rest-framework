module.exports = function(oauth, settings) {
    return new Security(oauth, settings);
}

var _ = require('underscore'),
        basic_auth = require('http-auth');
var request = require("request");
var Promise = require('bluebird');
/**
 * AuthoriseClient
 *
 * @param {Object}   config Instance of OAuth object
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
function Security(oauth, settings) {
    this.oauth = oauth;
    this.settings = settings;
    this.rules = settings.rules;
    return this;
}

Security.prototype.getSecurityMiddleware = function(rule) {
    var self = this;
    var rule = self.rules[rule];
    var methods = rule['methods'];
    var securityCallback = rule['callback'];

    return function(req, res, next) {
        if (!methods) {
            return next();
        }

        if (typeof methods == 'string') {
            methods = [methods];
        }

        if (_.contains(methods, 'oauth')) {

            if (self.oauth == null) {
                var oAuthAccessToken = "";

                var reg = new RegExp("^bearer ");
                var authorization = req.headers.authorization;
                if (authorization && reg.test(authorization.toLowerCase())) {
                    oAuthAccessToken = authorization.toLowerCase().replace("bearer ", "");
                }

                if (req.query.access_token) {
                    oAuthAccessToken = req.query.access_token;
                }

                new Promise(function(resolve, reject) {
                    if (oAuthAccessToken != null) {

                        request.get(self.settings.userd_me_url, {
                            auth: {
                                bearer: oAuthAccessToken
                            }
                        }, function(error, response, body) {
                            if (!error && response.statusCode == 200) {

                                req.user = JSON.parse(response.body);
                                var securityCallbackResult = true;
                                if (securityCallback != undefined) {
                                    console.log(securityCallback);
                                    securityCallbackResult = securityCallback(req.user)

                                    if (securityCallbackResult) {
                                        return resolve()
                                    } else {
                                        return reject();
                                    }
                                } else {
                                    return resolve();
                                }

                            } else {
                                return reject();
                            }
                        });



                    } else {
                        return reject();
                    }
                }).then(function() {
                    next();
                }).catch(function(e) {

                    res.send(401, {
                        error: "Authorization required"
                    });
                });
            }
            else {
                var reg = new RegExp("^bearer ");
                var authorization = req.headers.authorization;
                if (authorization && reg.test(authorization.toLowerCase())) {
                    return self.oauth.authorise()(req, res, next);
                } else {
                    res.send(401, {
                        error: "Authorization required"
                    });
                }
            }
        } else if (_.contains(methods, 'http')) {
            var reg = new RegExp("^basic ");
            var authorization = req.headers.authorization;
            console.log(authorization);
            if (authorization && reg.test(authorization.toLowerCase())) {
                var auth = basic_auth.basic({
                    realm: self.settings.basic.realm
                }, function(username, password, callback) { // Custom authentication method.
                    callback(username === self.settings.basic.user && password === self.settings.basic.password);
                });
                return basic_auth.connect(auth)(req, res, next);
            } else {
                res.send(401, {
                    error: "Authorization required"
                });
            }
        } else {
            res.send(401, {
                error: "Authorization required"
            });
        }

    }
}
