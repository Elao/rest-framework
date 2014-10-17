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




Controller.prototype.getTestValidatorNestedValidation = function() {

    return [{
            rules: {
                id: {
                    required: true
                },
                contacts: {
                    contentObjects: {
                        username: {
                            required: {value: true, group: ["create"], "message": "username required on body"}
                        },
                        email: {
                            required: true,
                            isEmail: true
                        }
                    }
                }
            },
            on: 'body'
        }       
    ]
}


Controller.prototype.getTestValidatorNestedAction = function(req, res) {
    var self = this;

    return {
        "ok": "ok"
    };
}




Controller.prototype.getTestValidatorValidation = function() {

    return [{
            rules: {
                username: {
                    required: {value: true, group: ["create"], "message": "username required on body"}
                },
                user_id: {
                    required: {value: true, group: ["create"]}
                },
                email: {
                    required: {value: true, group: ["create"]},
                    isEmail: {value: true},
                    custom: {value: function(e) {
                            return false
                        }, message: 'aie'}
                },
                birthday: {
                    required: {value: true, group: ["create"], "message": "birthday required on body"}
                }
            },
            on: 'body'
        },
        {
            rules: {
                username: {
                    required: {value: true, group: ["create"], "message": "username required on params"}
                },
            },
            on: 'params'
        }
    ]
}


Controller.prototype.getTestValidatorAction = function(req, res) {
    var self = this;

    return {
        "ok": "ok"
    };
}
