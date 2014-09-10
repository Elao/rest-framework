module.exports = function () {
    return new Validation();
}

var Promise     = require('bluebird'),
    util        = require('util'),
    _           = require('underscore');

/**
 * Validation service
  */
function Validation() {}

Validation.prototype.hello = function(name) {
    console.log("Hello " + name);
}
