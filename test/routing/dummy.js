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


Controller.prototype.getTestReturnPromiseWhichReturnFunctionAction = function(req, res) {

    return new Promise(function(resolve, reject) {

        var fn = function(req, res) {
            res.json("amazing")
        }

        return resolve(fn)
    });
}

Controller.prototype.getTestReturnPromiseWhichReturnPromiseEmptyAction = function(req, res) {

    return new Promise(function(resolve, reject) {

        var fn = new Promise(function(resolve, reject){
           return resolve();
        });

        return resolve(fn)
    });
}

Controller.prototype.getTestReturnPromiseWhichReturnPromiseObjectAction = function(req, res) {

    return new Promise(function(resolve, reject) {

        var fn = new Promise(function(resolve, reject){
           return resolve("amazing");
        });

        return resolve(fn)
    });
}

Controller.prototype.getTestReturnPromiseWhichReturnPromiseWichReturnPromiseAction = function(req, res) {

    return new Promise(function(resolve, reject) {

        var fn = new Promise(function(resolve, reject){
           return resolve(new Promise(function(resolve, reject){
               return resolve("inception")
           }));
        });

        return resolve(fn)
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
                            required: {value: true, "message": "username required on body"}
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
                    required: {value: true, "message": "username required on body"}
                },
                user_id: {
                    required: {value: true}
                },
                email: {
                    required: {value: true },
                    isEmail: {value: true},
                    custom: {value: function(e) {
                            return false
                        }, message: 'aie'}
                },
                birthday: {
                    required: {value: true, "message": "birthday required on body"}
                }
            },
            on: 'body'
        },
        {
            rules: {
                username: {
                    required: {value: true, "message": "username required on params"}
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


Controller.prototype.getTestValidatorErrorRulesValidation = function() {

    return [{
            rules: {
                username: {
                    wrong: {value: true, "message": "username required on body"},
                    custom: {
                        value: function(r) {
                            return true;
                        }
                    },
                    isString: {
                        value: true, message: "pas une string !"
                    }
                },
                email: {
                    required: true,
                    isEmail: true
                },
                optionalField: {
                    wrong: true
                }
            },
            on: 'body'
        },
        {
            rules: {
                username: {
                    wrong: {value: true, "message": "username required on params"},
                    custom: {
                        value: function(r) {
                            return true;
                        }
                    },
                    isString: {
                        value: true, message: "pas une string ! params"
                    }
                }
            },
            on: 'params'
        }
    ]
}


Controller.prototype.getTestValidatorErrorRulesAction = function(req, res) {
    var self = this;

    return {
        "ok": "ok"
    };
}


Controller.prototype.getTestValidatorSuccessValidation = function() {

    return [{
            rules: {
                username: {
                    required: {value: true, "message": "username required on body"},
                    custom: {
                        value: function(r) {
                            return true;
                        }
                    },
                    isString: {
                        value: true, message: "pas une string !"
                    }
                },
                email: {
                    required: true,
                    isEmail: true
                },
                optionalField: {
                    isEmail: true
                }
            },
            on: 'body'
        },
        {
            rules: {
                username: {
                    required: {value: true, "message": "username required on params"},
                    custom: {
                        value: function(r) {
                            return true;
                        }
                    },
                    isString: {
                        value: true, message: "pas une string ! params"
                    }
                }
            },
            on: 'params'
        }
    ]
}


Controller.prototype.getTestValidatorSuccessAction = function(req, res) {
    var self = this;

    return {
        "body": req.validatedValues.body("username"),
        "params": req.validatedValues.params("username")
    };
}


