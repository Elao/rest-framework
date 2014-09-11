module.exports = function (oauth, settings) {
    return new Security(oauth, settings);
}

var _      = require('underscore'),
basic_auth = require('http-auth');

/**
 * AuthoriseClient
 *
 * @param {Object}   config Instance of OAuth object
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
function Security(oauth, settings) {
    this.oauth    = oauth;
    this.settings = settings;
    this.rules    = settings.rules;
}

Security.prototype.getSecurityMiddleware = function(rule) {
    var self    = this;
    var rule    = self.rules[rule];
    var methods = rule['methods'];

    return function(req, res, next) {
        if (!methods) {
            return next();
        }

        console.log(methods);
        if (typeof methods == 'string') {
            methods = [methods];
        }

        if (_.contains(methods, 'oauth')) {
            var reg = new RegExp("^bearer ");
            var authorization = req.headers.authorization;
            if (authorization && reg.test(authorization.toLowerCase())) {
                return self.oauth.authorise()(req, res, next);
            }
        }

        if (_.contains(methods, 'http')) {
            var reg = new RegExp("^basic ");
            var authorization = req.headers.authorization;
            console.log(authorization);
            if (authorization && reg.test(authorization.toLowerCase())) {
                var auth = basic_auth.basic({
                    realm: self.settings.basic.realm
                }, function (username, password, callback) { // Custom authentication method.
                    callback(username === self.settings.basic.user && password === self.settings.basic.password);
                });
                return basic_auth.connect(auth)(req, res, next);
            }
        }

        res.send(401, {
            error: "Authorization required"
        });
    }
}
