var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

var Routing = require("../js/components/routing.js")
var Error = require("../js/components/error.js")
var Security = require("../js/components/security.js")

var should = require('chai').should(),
        expect = require('chai').expect,
        assert = require('chai').assert;

var Promise = require('bluebird');

var _ = require('lodash');

var express = require('express');
var request = require('supertest');

var app = express();

function generateNewRouting() {


    var errorHandler = Error({debug: false});
    var myRouting = Routing(
            app,
            Security({}, {
                rules: {
                    'dummy': {}
                }
            }), 
            {
                pathControllers: 'test/routing'
            },
    errorHandler
            );
    return myRouting;
}

describe('Routing components test ', function() {


    it("should work when controller return object json ", function(done) {

        var myRouting = generateNewRouting();
        myRouting.loadController('dummy', {});
        myRouting.loadRoute('GET', '/test/objectJson', 'dummy', 'dummy/testReturnObject');

        request(app)
                .get('/test/objectJson')
                .expect('{\n  "ok": "ok"\n}')
                .expect(200, done);
    });



    it("should handle when controller return function", function(done) {

        var myRouting = generateNewRouting();
        myRouting.loadController('dummy', {});
        myRouting.loadRoute('GET', '/test/function', 'dummy', 'dummy/testReturnFunction');

        request(app)
                .get('/test/function')
                .expect('{\n  "ok": "ok"\n}')
                .expect(200, done);
    });


    it("should handle when controller return Promise", function(done) {

        var myRouting = generateNewRouting();
        myRouting.loadController('dummy', {});
        myRouting.loadRoute('GET', '/test/promise', 'dummy', 'dummy/testReturnPromise');

        request(app)
                .get('/test/function')
                .expect('{\n  "ok": "ok"\n}')
                .expect(200, done);
    });

    it("should throw error when controller forgot return result", function(done) {

        var myRouting = generateNewRouting();
        myRouting.loadController('dummy', {});
        myRouting.loadRoute('GET', '/test/missing', 'dummy', 'dummy/testReturnMissing');

        request(app)
                .get('/test/missing')
                .expect('{\n  "error": "INTERNAL_ERROR"\n}')
                .expect(500, done);
    });

    it("should not load route with an custom HTTP VERB", function() {

        var myRouting = generateNewRouting();
        myRouting.loadController('dummy', {});
        var e = myRouting.loadRoute('TESTER', '/objectJson', 'dummy', 'dummy/objectJson');
        return assert.isUndefined(e, "why custom HTTP VERB work now ?")
    });

    it("should handle error when load wrong controller method", function(done) {

        var myRouting = generateNewRouting();
        myRouting.loadController('dummy', {});
        try {
            myRouting.loadRoute('GET', '/azerty', 'dummy', 'dummy/azerty');
            done(new Error('must throw an error. Azerty is not defined for controller'))
        }
        catch (e) {
            done();
        }
    });

    it("should handle ReferenceError", function(done) {

        var myRouting = generateNewRouting();
        myRouting.loadController('dummy', {});
        myRouting.loadRoute('GET', '/referenceError', 'dummy', 'dummy/referenceError');

        request(app)
                .get('/referenceError')
                .expect('{\n  "error": "vars is not defined"\n}')
                .expect(500, done);
    });


})