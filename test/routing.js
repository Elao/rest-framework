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
                rules: {
                    dummy: {
                        methods: ['guest']
                    }
                }
            },
            {
                pathControllers: process.cwd() +'/test/routing'
            },
    errorHandler
            );
    return myRouting;
}

describe('Routing components test ', function() {

    var myRouting = generateNewRouting();
    myRouting.loadController('dummy', {});
    myRouting.loadRoute('GET', '/test/objectJson', 'dummy', 'dummy/testReturnObject');
    myRouting.loadRoute('GET', '/test/function', 'dummy', 'dummy/testReturnFunction');
    myRouting.loadRoute('GET', '/test/promise', 'dummy', 'dummy/testReturnPromise');
    myRouting.loadRoute('GET', '/test/missing', 'dummy', 'dummy/testReturnMissing');
    myRouting.loadRoute('GET', '/referenceError', 'dummy', 'dummy/referenceError');
    myRouting.loadRoute('POST', '/testValidator', 'dummy', 'dummy/testValidator');
    myRouting.loadRoute('POST', '/testValidatorNested', 'dummy', 'dummy/testValidatorNested');
    myRouting.loadRoute('POST', '/testValidatorErrorRules/:username', 'dummy', 'dummy/testValidatorErrorRules');
    myRouting.loadRoute('POST', '/testValidatorSuccess/:username', 'dummy', 'dummy/testValidatorSuccess');


    it("should not load route with an custom HTTP VERB", function() {

        var e = myRouting.loadRoute('TESTER', '/objectJson', 'dummy', 'dummy/objectJson');
        return assert.isUndefined(e, "why custom HTTP VERB work now ?")
    });

    it("should handle error when load wrong controller method", function(done) {

        myRouting.loadController('dummy', {});
        try {
            myRouting.loadRoute('GET', '/azerty', 'dummy', 'dummy/azerty');
            done(new Error('must throw an error. Azerty is not defined for controller'))
        }
        catch (e) {
            done();
        }
    });
    
    it("should work when controller return object json ", function(done) {

        request(app)
                .get('/test/objectJson')
                .expect('{\n  "ok": "ok"\n}')
                .expect(200, done);
    });


    it("should handle when controller return function", function(done) {

        request(app)
                .get('/test/function')
                .expect('{\n  "ok": "ok"\n}')
                .expect(200, done);
    });

    it("should handle when controller return Promise", function(done) {

        request(app)
                .get('/test/function')
                .expect('{\n  "ok": "ok"\n}')
                .expect(200, done);
    });

    it("should throw error when controller forgot return result", function(done) {

        request(app)
                .get('/test/missing')
                .expect(function(res) {

                    if (!('date' in res.body))
                        return "missing date key";

                    if (!('details' in res.body))
                        return "missing details key";

                    if (!('error' in res.body))
                        return "vars is not defined";

                    if (res.body.error != "INTERNAL_ERROR")
                        return "error key invalid";

                    if (res.body.statusCode != "500")
                        return "status code key invalid";
                })
                .expect(500, done);
    });

    it("should handle ReferenceError", function(done) {

        request(app)
                .get('/referenceError')
                .expect(function(res) {

                    if (!('date' in res.body))
                        return "missing date key";

                    if (!('details' in res.body))
                        return "missing details key";

                    if (!('error' in res.body))
                        return "missing error key";

                    if (res.body.error != "vars is not defined")
                        return "error key invalid";

                    if (res.body.statusCode != "500")
                        return "status code key invalid";
                })
                .expect(500, done);
    });

    it("should handle ValidationError", function(done) {

        request(app)
                .post('/testValidator')
                .send({email: "email"})
                .expect(function(res) {

                    if (!('date' in res.body))
                        return "missing date key";

                    if (!('details' in res.body))
                        return "missing details key";

                    if (!('error' in res.body))
                        return "missing error key";

                    if (res.body.error != "INVALID_PARAMETERS")
                        return "error key invalid";

                    if (!_.isArray(res.body.details.errors))
                        return "details.errors must be an array";


                    if (res.body.details.errors[0].field != "username")
                        return "username error not throw";

                    if (res.body.details.errors[0].on != "body")
                        return "username error not throw on body";

                    if (res.body.statusCode != "400")
                        return "status code key invalid";
                })
                .expect(400, done);
    });

    it("should handle ValidationError with Nested object", function(done) {

        request(app)
                .post('/testValidatorNested')
                .send({contacts: [{"email": "foo", "username": "guillaume"}, {"email": "bar"}, {}]})
                .expect(function(res) {

                    if (!('date' in res.body))
                        return "missing date key";

                    if (!('details' in res.body))
                        return "missing details key";

                    if (!('error' in res.body))
                        return "missing error key";

                    if (res.body.error != "INVALID_PARAMETERS")
                        return "error key invalid";

                    if (res.body.statusCode != "400")
                        return "status code key invalid";

                    if (!_.isArray(res.body.details.errors))
                        return "details.errors must be an array";

                    if (res.body.details.errors[0].field != "id")
                        return "id error not throw";

                    if (!_.isArray(res.body.details.errors[0].error))
                        return "id error not throw an array errors";

                    if (res.body.details.errors[0].on != "body")
                        return "id error not throw on body";

                    if (res.body.details.errors[1].field != "contacts.0.email")
                        return "errors email on first contact not throw";

                    if (!_.isArray(res.body.details.errors[1].error))
                        return "email on first contact error not throw an array errors";

                    if (res.body.details.errors[1].on != "body")
                        return "email on first contact error not throw on body";


                    if (res.body.details.errors[2].field != "contacts.1.username")
                        return "errors username on second contact not throw";

                    if (!_.isArray(res.body.details.errors[2].error))
                        return "username on second contact error not throw an array errors";

                    if (res.body.details.errors[2].on != "body")
                        return "username on second contact error not throw on body";


                })
                .expect(400, done);
    });

    it("should handle validation error when rules are not configured properly", function(done) {

        request(app)
                .post('/testValidatorErrorRules/guillaume')
                .send({username: "cool", email: "moi@moi.fr"})
                .expect(function(res) {

                    if (!('details' in res.body))
                        return "missing date key";

                    if (res.body.details.errors[0].field != "username")
                        return "username error not throw on body";

                    if (res.body.error != "INVALID_PARAMETERS")
                        return "error key invalid";

                })
                .expect(400, done);
    });


    it("should handle validation success", function(done) {

        request(app)
                .post('/testValidatorSuccess/guillaume')
                .send({username: "cool", email: "moi@moi.fr"})
                .expect(function(res) {

                    if (res.body.params != "guillaume")
                        return "params key invalid";

                    if (res.body.body != "cool")
                        return "body key invalid";
                })
                .expect(200, done);
    });



})