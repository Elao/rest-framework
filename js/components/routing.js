module.exports = function(app, security, validation, settings, errorHandler) {
    return new Routing(app, security, validation, settings, errorHandler);
}

var _ = require('lodash'),
        changeCase = require('change-case'),
        rfUtils = require('./utils');



var Routing = function(app, security, validation, settings, errorHandler) {
    this.app = app;
    this.security = security;
    this.validation = validation;
    this.settings = _.extend({
        pathControllers: './controllers'
    }, settings);
    this.controllers = {};

    this.errorHandler = errorHandler;

    return this;
}

Routing.prototype.loadController = function(name, config) {

    var controller = require(process.cwd() + '/' + this.settings.pathControllers + '/' + name)(this.app, config);
    this.controllers[(name.toLowerCase())] = controller;

    return controller;
}


Routing.prototype.loadRoute = function(method, route, security, controller, validator) {
    //console.log("[+] " + method + " " + route + (validator ? " (validation)" : ""));

    var args = [route, this.security.getSecurityMiddleware(security)];
    var m;
    switch (method.toLowerCase()) {
        case 'all':
            m = this.app.all;
            break;
        case 'get':
            m = this.app.get;
            break;
        case 'post':
            m = this.app.post;
            break;
        case 'delete':
            m = this.app.delete;
            break;
        case 'patch':
            m = this.app.patch;
            break;
        default:
            //console.log("Method not allowed: " + method);
            return;
    }

    if (_.isFunction(controller)) {
        args.push(controller);
    } else {
        var methods = this.resolveControllerValidation(controller);
        var wrapperController = new WrapperController(this.errorHandler, methods);

        args.push(wrapperController.handleRequest());
        /*
         if (_.isFunction(methods.validation)) {
         console.log("Loading validation components");
         args.push(this.validation.getValidationMiddleware(methods.validation));
         }
         */
        //args.push(methods['action'].apply(methods['controller'], []));
    }
    m.apply(this.app, args);

    return this;
}


WrapperController = function(errorHandler, methods) {
    this.methods = methods;
    this.errorHandler = errorHandler;

    return this;
}

WrapperController.prototype.handleRequest = function() {

    var self = this;
    return function(req, res, next) {

        try {
            var handler = self.methods['action'].apply(self.methods['controller'], [req, res]);

            if (rfUtils.isPromise(handler)) {

                handler.then(function(jsonResult) {
                    res.json(jsonResult);
                }).catch(function(e) {
                    // promise failed
                    return self.errorHandler.handleError(e, req, res, next);
                });

            } else if (typeof handler == "object") {
                res.json(handler);
            } else if (typeof handler == "function") {
                return handler(req, res);
            } else {
                var e = new Error("INTERNAL_ERROR");
                throw e;
            }

        } catch (e) {
            // catch for non promise return
            return self.errorHandler.handleError(e, req, res, next);
        }
    }
};

Routing.prototype.resolveControllerValidation = function(controllerName) {
    var parts = controllerName.split('/');
    if (parts.length != 2) {
        throw new Error("Error resolving " + controllerName);
        return;
    }

    var controller = parts[0].toLowerCase();
    var action = parts[1];
    var methodAction = 'get' + changeCase.upperCaseFirst(action) + 'Action';
    var methodValidation = 'get' + changeCase.upperCaseFirst(action) + 'Validation';
    var validation = null;

    if (!_.has(this.controllers, controller)) {
        throw new Error("Controller not found : " + controller);
    }

    if (!_.isFunction(this.controllers[controller][methodAction])) {
        throw new Error("Method not found : " + methodAction + " on controller " + controller);
    }

    if (_.isFunction(this.controllers[controller][methodValidation])) {
        validation = this.controllers[controller][methodValidation];
    }

    return {controller: this.controllers[controller], action: this.controllers[controller][methodAction], validation: validation};
}
