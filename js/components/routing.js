module.exports = function(app, settings) {
    return new Routing(app, settings);
}

var _           = require('underscore');

var Routing = function(app, security, settings) {
    this.app          = app;
    this.security     = security;
    this.settings     = _.extend({
        pathControllers: './controllers'
    }, settings);

    return this;
}

Routing.prototype.loadController = function(name, config) {
    return require(process.cwd() + '/'+ this.settings.pathControllers + '/' + name)(this.app, config);
}

Routing.prototype.loadRoute = function(method, route, security, controller) {
    console.log("[+] " + method + " " + route);
    var m;
    switch(method.toLowerCase()) {
        case 'all':     m = this.app.all;    break;
        case 'get':     m = this.app.get;    break;
        case 'post':    m = this.app.post;   break;
        case 'delete':  m = this.app.delete; break;
        case 'patch':   m = this.app.patch;  break;
        default:        console.log("Method not allowed: "+method); return;
    }

    m.call(this.app, route, this.security.getSecurityMiddleware(security), controller);
    return this;
}

