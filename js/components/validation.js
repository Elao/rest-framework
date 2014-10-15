module.exports = function() {
    return new Validation();
}

var _ = require('lodash'),
        basic_auth = require('http-auth');
var Promise = require('bluebird');

/**
 * AuthoriseClient
 *
 * @param {Object}   config Instance of OAuth object
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
function Validation() {
    return this;
}

Validation.prototype.getValidationMiddleware = function(rules) {
    var self = this;

    return function(req, res, next) {
        next();
    }
}
