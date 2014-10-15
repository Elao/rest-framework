var util = require('util');
var    _ = require('lodash');

var rfUtils = require('./utils');

module.exports = function(config) {
    return new handler(config);
}


handler = function(config) {
    this.config = config;

    this.NotFoundError.prototype = Object.create(Error.prototype);
    this.AccessDeniedError.prototype = Object.create(Error.prototype);
    this.MissingParametersError.prototype = Object.create(Error.prototype);

    return this;
}

handler.prototype.handleError = function(e, req, res, next) {

    if (util.isError(e)) {

        // Better to use EventEmitter no ?
        if (this.config.debug == true) {
            console.log(e.stack)
        }

        var errorDisplayed = {error: rfUtils.errorsToString(e)};

        if (this.config.debug) {
            errorDisplayed.stack = e.stack;
        }

        // Handle default Javascript Error as Internal Error
        if (e instanceof TypeError || e instanceof ReferenceError) {
            return res.status(500).json(errorDisplayed);
        }

        // Handle our rest-framework error
        switch (e.name) {
            case 'NotFoundError':
                return res.status(404).json(errorDisplayed);
                break;

            case 'MissingParametersError':
                return res.status(400).json(errorDisplayed);
                break;
            case 'AccessDeniedError':
                return res.status(403).json(errorDisplayed);
                break;
        }

        // If you emit custom error with statusCode
        if (e.statusCode != undefined) {
            return res.status(e.statusCode).json(errorDisplayed);
        }

        // bad use of rest-framework
    } else if (_.isString(e)) {
        return res.status(500).json({error: e});
    }

    return res.status(400).json({error: rfUtils.errorsToString(e)});
}

handler.prototype.NotFoundError = function(message, type, id)
{
    var self = this;

    self.type = type;
    self.message = "NOT_FOUND";
    self.item_id = id;
    if (message != "") {
        self.message = message;
    }

    if (this.config != undefined && this.config.debug) {
        self.message += "  debug:  " + type + " with id: " + id;
    }

    self.name = 'NotFoundError';
    Error.captureStackTrace(this, handler.prototype.NotFoundError);
    return self;
}


handler.prototype.AccessDeniedError = function(message, reason)
{
    var self = this;

    self.message = "NOT_ALLOWED";
    if (message != "") {
        self.message = message;
    }

    if (this.config != undefined && this.config.debug) {
        self.message += "   debug: " + reason;
    }

    self.reason = reason;

    self.name = 'AccessDeniedError';
    Error.captureStackTrace(this, handler.prototype.AccessDeniedError);
    return self;
}


handler.prototype.MissingParametersError = function(message, fields)
{
    var self = this;

    self.message = "MISSING_PARAMETERS";
    if (message != "") {
        self.message = message;
    }

    if (this.config != undefined && this.config.debug) {
        self.message += "   debug: " + fields;
    }

    self.name = 'MissingParametersError';
    self.fields = fields;

    Error.captureStackTrace(this, handler.prototype.MissingParametersError);
    return self;
}
