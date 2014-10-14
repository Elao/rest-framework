var util = require('util');
var _ = require('underscore');

var amablaUtils = require('./utils');

module.exports = function(config) {
    return new handler(config);
}


handler = function(config) {
    this.config = config;
    return this;
}

handler.prototype.handleError = function(e, req, res, next) {

    if (util.isError(e)) {

        // Better to use EventEmitter no ?
        if (this.config.debug == true) {
            console.log(e.stack)
        }

        var errorDisplayed = {error: amablaUtils.errorsToString(e)};

        if (this.config.debug) {
            errorDisplayed.stack = e.stack;
        }

        // Handle default Javascript Error as Internal Error
        if (e instanceof TypeError || e instanceof ReferenceError) {
            return res.status(500).json(errorDisplayed);
        }

        // Handle our amabla error
        switch (e.name) {
            case 'NotFoundError':
                return res.status(404).json(errorDisplayed);
                break;
            case 'AccessDeniedError':
                return res.status(403).json(errorDisplayed);
                break;
        }

        // If you emit custom error with statusCode
        if (e.statusCode != undefined) {
            return res.status(e.statusCode).json(errorDisplayed);
        }

    // bad use of amabla-core
    } else if (_.isString(e)) {
        return res.status(500).json({error: e});
    }

    return res.status(400).json({error: amablaUtils.errorsToString(e)});
}

handler.prototype.NotFoundError = function(message, type, id)
{
    var self = new Error();
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
    self._proto_ = handler.prototype;
    return self;
}


handler.prototype.AccessDeniedError = function(message, reason)
{
    var self = new Error();

    self.message = "NOT_ALLOWED";
    if (message != "") {
        self.message = message;
    }

    if (this.config != undefined && this.config.debug) {
        self.message += "   debug: " + reason;
    }

    self.name = 'AccessDeniedError';
    self._proto_ = handler.prototype;
    return self;
}


handler.prototype.MissingParametersError = function(message, fields)
{
    var self = new Error();

    self.message = "MISSING_PARAMETERS";
    if (message != "") {
        self.message = message;
    }

    if (this.config != undefined && this.config.debug) {
        self.message += "   debug: " + fields;
    }

    self.name = 'MissingParametersError';
    self._proto_ = handler.prototype;
    return self;
}