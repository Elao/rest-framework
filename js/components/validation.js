module.exports = function () {
    return new Validation();
}

var Promise  = require('bluebird'),
    util     = require('util'),
    _        = require('underscore');

/**
 * Validation service
  */
function Validation(validators) {
    this.Validate = require('validate.js');
    var self = this;
    if (_.isObject(validators)) {
        _.each(validators, function(callback, name) {
            self.addValidator(name, callback);
        })
    }
    return this;
}

Validation.prototype.addValidator = function(name, callback) {
    this.Validate.validators[name] = callback;
}

Validation.prototype.getValidationMiddleware = function(constraintsProvider) {
    var self = this;
    return function(req, res, next) {
        return new Promise(function(resolve, reject) {
            if (_.isFunction(constraintsProvider)) {
                resolve(constraintsProvider(req));
            } else if (_.isObject(constraintsProvider)) {
                resolve(constraintsProvider);
            } else {
                resolve({});
            }
            return reject(new Error('invalid constraints provided : ', constraintsProvider));
        }).then(function(constraints) {
            return self.validateObject(req, constraints);
        }).then(function(data) {
            req.validationData = data;
            return next();
        }).catch(function(e) {
            console.log("Error in validation middleware: ", e);
            throw e;
        })
    }
}

Validation.prototype.validateRequest = function(request, constraints) {
    var validations = [];
    _.each(constraints, function(constraints, type) {
        var object = false;
        switch(type) {
            case 'body':    object = req.body;
            case 'query':   object = req.query;
            case 'params':  object = req.params;
            default:
                throw new Error("Invalid request type "+type);
        }
        validations.push(self.validateObject(object, constraints));
    });
    return Promise.settle(validations).then(function(results) {

    });
}

Validation.prototype.validateObject = function(object, constraints) {
    var self = this;
    return new Promise(function(resolve, reject) {
        // Validate an object



    });
}



Validation.prototype.validateObject = function(object, withRequired) {
    var self = this;

    if (withRequired) {
        var errors = [];
        _.each(self.getRequiredFields(), function(field) {
            if (!_.has(object, field)) {
                errors.push(self.getError(field, null, 'MISSING'));
            }
        })
        if (errors.length > 0) {
            throw errors;
        }
    }

    var validations = _.map(object, function(value, key, list) {
        return self.validateField(key, value);
    });

    return Promise.settle(validations).then(function(results) {
        var errors = [];
        for (ri in results) {
            if (results[ri].isRejected()) {
                errors.push(results[ri].reason());
            }
        }
        if (errors.length > 0) {
            throw errors;
        } else {
            return object;
        }
    });
}

Validation.prototype.transformObject = function(object) {
    var self = this;

    var transformations = _.object(_.map(object, function (value, key) {
        return [key, self.transformField(key, value)];
    }));

    return Promise.props(transformations);
}

        /*
        var configuration = req.validation;
        console.log("Configuration for middleware is : ", configuration);
        var type   = configuration.type;
        var object = null;
        switch(type) {
            case 'query':
                req.query;
                break;
            case 'body':
                req.body;
                break;
            case 'params':
                req.params;
                break;
        }

        req.cleanData = {
            username: "my wonderfull username";
        }

        next();
        */

