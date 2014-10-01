module.exports = function(app, security, validation, settings) {
    return new Routing(app, security, validation, settings);
}

var _          = require('underscore'),
    changeCase = require('change-case');


var Routing = function(app, security, validation, settings) {
    this.app          = app;
    this.security     = security;
    this.validation   = validation;
    this.settings     = _.extend({
        pathControllers: './controllers'
    }, settings);
    this.controllers  = {};

    return this;
}

Routing.prototype.loadController = function(name, config) {

    var controller = require(process.cwd() + '/'+ this.settings.pathControllers + '/' + name)(this.app, config);
    this.controllers[(name.toLowerCase())] = controller;

    return controller;
}

Routing.prototype.resolveControllerValidation = function(controllerName) {
    var parts      = controllerName.split('/');
    if (parts.length != 2) {
        throw new Error("Error resolving " + controllerName);
        return;
    }

    var controller       = parts[0].toLowerCase();
    var action           = parts[1];
    var methodAction     = 'get' + changeCase.upperCaseFirst(action)+ 'Action';
    var methodValidation = 'get' + changeCase.upperCaseFirst(action)+ 'Validation';
    var validation       = null;

    if (!_.has(this.controllers, controller)) {
        throw new Error("Controller not found : " + controller);
    }

    if (!_.isFunction(this.controllers[controller][methodAction])) {
        throw new Error("Method not found : " + methodAction + " on controller "+controller);
    }

    if (_.isFunction(this.controllers[controller][methodValidation])) {
        validation = this.controllers[controller][methodValidation];
    }

    return {controller: this.controllers[controller], action: this.controllers[controller][methodAction], validation: validation};
}


Routing.prototype.loadRoute = function(method, route, security, controller, validator) {
    console.log("[+] " + method + " " + route + (validator ? " (validation)" : ""));

    var args = [route, this.security.getSecurityMiddleware(security)];
    var m;
    switch(method.toLowerCase()) {
        case 'all':     m = this.app.all;    break;
        case 'get':     m = this.app.get;    break;
        case 'post':    m = this.app.post;   break;
        case 'delete':  m = this.app.delete; break;
        case 'patch':   m = this.app.patch;  break;
        default:        console.log("Method not allowed: "+method); return;
    }

    if (_.isFunction(controller)) {
        args.push(controller);
    } else {
        var methods = this.resolveControllerValidation(controller);
        args.push(this.featuresMiddleware(methods['controller']));
        /*
         if (_.isFunction(methods.validation)) {
         console.log("Loading validation components");
         args.push(this.validation.getValidationMiddleware(methods.validation));
         }
         */
        args.push(methods['action'].apply(methods['controller'], []));
    }
    m.apply(this.app, args);

    return this;
}

Routing.prototype.featuresMiddleware = function(controller) {
    return function(req, res, next) {
        console.log("add method generateUrl to controller")
        controller.generateUrl = function(path) {
            return req.protocol + '://' + req.get('host') + path;
        };
        next();
    }
}