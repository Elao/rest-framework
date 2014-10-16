var Promise = require('bluebird');

module.exports = function(app, config) {
    return new Controller(app, config);
}



Controller = function(app, config) {
    this.config = config;
    this.app = app;

    return this;
}

Controller.prototype.getTestReturnObjectAction = function(req, res) {

    return {
        "ok": "ok"
    }
}

Controller.prototype.getTestReturnFunctionAction = function(req, res) {

    return function(req, res, next) {
        res.json({
            "ok": "ok"
        })
    }
}

Controller.prototype.getTestReturnPromiseAction = function(req, res) {

    return new Promise(function(resolve, reject) {
        resolve({
            "ok": "ok"
        })
    });
}



Controller.prototype.getTestReturnMissingAction = function(req, res) {

}

Controller.prototype.getReferenceErrorAction = function(req, res) {
    var self = this;

    console.log(vars / 0);

    return {
        "ok": "ok"
    };
}

