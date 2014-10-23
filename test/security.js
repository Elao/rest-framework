var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

var Routing = require("../js/components/routing.js")
var Error = require("../js/components/error.js")

var should = require('chai').should(),
        expect = require('chai').expect,
        assert = require('chai').assert;

var Promise = require('bluebird');

var _ = require('lodash');

var express = require('express');
var request = require('supertest');

var app = express();
app.use(express.bodyParser());

function generateNewRouting() {


    var errorHandler = Error({debug: false});
    var myRouting = Routing(
            app,
            {
                pathMiddlewares: process.cwd() +"/test/customMiddleware",
                methods: { 
                    onlyMe: {
                        config: {
                        },
                        validation: function(config, req, res) {
                            return new Promise(function(resolve, reject) {

                                if (req.user.id == req.params.id) {
                                    resolve();
                                } else {
                                    return reject();
                                }
                            });
                        }
                    },
                    http: {
                        config: {
                            user: 'moi',
                            password: 'moi'
                        }
                    },
                    oauth2: {
                        extends: 'oauth',
                        config: {
                            accessTokenExtractor: function(config, req, res) {
                                return req.query.at;
                            }
                        }
                    },
                    oauth3: {
                        extends: 'oauth2',
                        config: {
                            accessTokenExtractor: function(config, req, res) {
                                return req.query.at2;
                            }
                        }
                    }
                },
                rules: {
                    routeSecureById: {
                        methods: ['filterWithId']
                    },
                    httpbasicOnly: {
                        methods: ['http']
                    },
                    oauthOnly: {
                        methods: ['oauth']
                    },
                    user: {
                        methods: [{
                                caca: {
                                    config: {
                                    },
                                    validation: function(config, req, res) {
                                        return new Promise(function(resolve, reject) {
                                            resolve();
                                        })
                                    }
                                }
                            }, 'filterWithId', 'oauth', 'http']
                    },
                    exclusiveUser: {
                        methodsMode: 'and',
                        methods: ['oauth', 'onlyMe']
                    },
                    userWhoSendOauthAccessTokenInFuckingParamers: {
                        methods: ['oauth2']
                    },
                    userWhoSendOauthAccessTokenInFuckingParamers2: {
                        methods: ['oauth3']
                    },
                    userWhoSendOauthAccessTokenInFuckingParamers3: {
                        methods: [{
                                oauth4: {
                                    extends: 'oauth3',
                                    config: {
                                        accessTokenExtractor: function(config, req, res) {
                                            return req.query.at3;
                                        }
                                    }
                                }
                            }]
                    },
                }
            },
    {
        pathControllers: 'test/routing'
    },
    errorHandler
            );
    return myRouting;
}

describe('Security components test ', function() {

    var myRouting = generateNewRouting();
    myRouting.loadController('dummy', {});
    myRouting.loadRoute('GET', '/test/routepublic', 'guest', 'dummy/testReturnObject');
    myRouting.loadRoute('GET', '/test/routeproctedByCustomMethod', 'routeSecureById', 'dummy/testReturnObject');
    myRouting.loadRoute('GET', '/test/routeprotectedbyHttpbasic', 'httpbasicOnly', 'dummy/testReturnObject');
    myRouting.loadRoute('GET', '/test/routeprotectedByOauth', 'oauthOnly', 'dummy/testReturnObject');
    myRouting.loadRoute('GET', '/test/:id/profil', 'exclusiveUser', 'dummy/testReturnObject');
    myRouting.loadRoute('GET', '/test/usermany', 'user', 'dummy/testReturnObject');
    myRouting.loadRoute('GET', '/test/routeprotectedByOauthCustom', 'userWhoSendOauthAccessTokenInFuckingParamers', 'dummy/testReturnObject');
    myRouting.loadRoute('GET', '/test/routeprotectedByOauthCustom2', 'userWhoSendOauthAccessTokenInFuckingParamers2', 'dummy/testReturnObject');
    myRouting.loadRoute('GET', '/test/routeprotectedByOauthCustom3', 'userWhoSendOauthAccessTokenInFuckingParamers3', 'dummy/testReturnObject');




    it("should return 200 with guest method provided by default", function(done) {

        request(app)
                .get('/test/routepublic')
                .expect(function(res) {
                })
                .expect(200, done);
    });


    it("should return 401 with custom filterWithId method malformed", function(done) {

        request(app)
                .get('/test/routeproctedByCustomMethod')
                .expect(function(res) {
                })
                .expect(401, done);
    });

    it("should return 200 with custom filterWithId method", function(done) {

        request(app)
                .get('/test/routeproctedByCustomMethod?id=1')
                .expect(function(res) {
                })
                .expect(200, done);
    });

    it("should return 401 with http basic", function(done) {

        request(app)
                .get('/test/routeprotectedbyHttpbasic')
                .expect(function(res) {
                })
                .expect(401, done);
    });

    it("should return 200 with http basic", function(done) {

        request(app)
                .get('/test/routeprotectedbyHttpbasic')
                .auth("moi", "moi")
                .expect(function(res) {
                })
                .expect(200, done);
    });



    var myRouting = generateNewRouting();
    myRouting.loadController('dummy', {});

    it("should return 200 with userd oauth", function(done) {

        request(app)
                .get('/test/routeprotectedByOauth?access_token=user_a')
                .expect(function(res) {
                })
                .expect(200, done);
    });

    it("should return 401 with userd oauth", function(done) {

        request(app)
                .get('/test/routeprotectedByOauth')
                .expect(function(res) {
                })
                .expect(401, done);
    });


    it("should return 200 with many method oauth", function(done) {

        request(app)
                .get('/test/usermany?access_token=user_a')
                .expect(function(res) {
                })
                .expect(200, done);
    });

    it("should return 401 with many method configured in 'and' way without access token", function(done) {

        request(app)
                .get('/test/2/profil')
                .expect(function(res) {
                })
                .expect(401, done);
    });


    it("should return 401 with many method configured in 'and' way with invalid id", function(done) {

        request(app)
                .get('/test/2/profil?access_token=user_a')
                .expect(function(res) {
                })
                .expect(401, done);
    });


    it("should return 200 with many method configured in 'and' way", function(done) {

        request(app)
                .get('/test/1/profil?access_token=user_a')
                .expect(function(res) {
                })
                .expect(200, done);
    });


    it("should return 401 with for routeprotectedByOauthCustom", function(done) {

        request(app)
                .get('/test/routeprotectedByOauthCustom?at=unmauvaisaccesstokenmec')
                .expect(function(res) {
                })
                .expect(401, done);
    });

    it("should return 200 with for routeprotectedByOauthCustom", function(done) {

        request(app)
                .get('/test/routeprotectedByOauthCustom?at=user_a')
                .expect(function(res) {
                })
                .expect(200, done);
    });


    it("should return 200 with for routeprotectedByOauthCustom2", function(done) {

        request(app)
                .get('/test/routeprotectedByOauthCustom2?at2=user_b')
                .expect(function(res) {
                })
                .expect(200, done);
    });


    it("should return 401 with for routeprotectedByOauthCustom2", function(done) {

        request(app)
                .get('/test/routeprotectedByOauthCustom2?at2=unknnnnn')
                .expect(function(res) {
                })
                .expect(401, done);
    });



    it("should return 200 with for routeprotectedByOauthCustom3", function(done) {

        request(app)
                .get('/test/routeprotectedByOauthCustom3?at3=user_c')
                .expect(function(res) {
                })
                .expect(200, done);
    });


    it("should return 401 with for routeprotectedByOauthCustom3", function(done) {

        request(app)
                .get('/test/routeprotectedByOauthCustom3?at3=unknnnnn')
                .expect(function(res) {
                })
                .expect(401, done);
    });

    it("should return 401 with for routeprotectedByOauthCustom3 with wrong parameters", function(done) {

        request(app)
                .get('/test/routeprotectedByOauthCustom3?at2=unknnnnn')
                .expect(function(res) {
                })
                .expect(401, done);
    });






})