var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

var errorComponents = require("../js/components/error.js")

var should = require('chai').should(),
        expect = require('chai').expect,
        assert = require('chai').assert;

var Promise = require('bluebird');
var _ = require('lodash');

var express = require('express');
var request = require('supertest')

describe('Error components', function() {
    it('should "errorComponents" has good signature', function() {
        return assert.typeOf(errorComponents, 'function', 'errorComponents is not a function')
    });

    it('should "errorComponents" has mandatory method', function() {

        var c = new errorComponents();

        expect(c).to.respondTo('NotFoundError');
        expect(c).to.respondTo('AccessDeniedError');
        expect(c).to.respondTo('MissingParametersError');
        expect(c).to.respondTo('handleError');
    });

})


describe('#NotFoundError', function() {

    it("should return an Error object", function() {

        var c = new errorComponents();

        var error = new c.NotFoundError("MESSAGE", "type", "id");
        expect(error.item_id).equal("id");
        expect(error.type).equal("type");
        expect(error.message).equal("MESSAGE");
        expect(error.name).equal("NotFoundError");

    })

    it("should return an Error object", function() {

        var c = new errorComponents();

        var error = new c.NotFoundError("", "type", "id");
        expect(error.item_id).equal("id");
        expect(error.type).equal("type");
        expect(error.message).equal("NOT_FOUND");
        expect(error.name).equal("NotFoundError");
    })
});


describe('#AccessDeniedError', function() {

    it("should return an Error object", function() {

        var c = new errorComponents();

        var error = new c.AccessDeniedError("MESSAGE", "type");
        expect(error.reason).equal("type");
        expect(error.message).equal("MESSAGE");
        expect(error.name).equal("AccessDeniedError");

    })

    it("should return an Error object", function() {

        var c = new errorComponents();

        var error = new c.AccessDeniedError("", "type");
        expect(error.reason).equal("type");
        expect(error.message).equal("NOT_ALLOWED");
        expect(error.name).equal("AccessDeniedError");
    })
});


describe('#MissingParametersError', function() {

    it("should return an Error object", function() {

        var c = new errorComponents();

        var error = new c.MissingParametersError("MESSAGE", "fields");
        expect(error.fields).equal("fields");
        expect(error.message).equal("MESSAGE");
        expect(error.name).equal("MissingParametersError");
    })

    it("should return an Error object", function() {

        var c = new errorComponents();

        var error = new c.MissingParametersError("", "fields");
        expect(error.fields).equal("fields");
        expect(error.message).equal("MISSING_PARAMETERS");
        expect(error.name).equal("MissingParametersError");
    })
});


describe('#handleError', function() {

    it("should handle MissingParametersError default error", function(done) {

        var app = express();
        app.use(function(req, res) {

            var c = new errorComponents({debug: false});

            var e = new c.MissingParametersError("", "fields");
            c.handleError(e, req, res);

            return res;
        });
        request(app)
                .post('/')
                .expect('{\n  "error": "MISSING_PARAMETERS"\n}')
                .expect(400, done);
    })


    it("should handle MissingParametersError with custom message", function(done) {

        var app = express();
        app.use(function(req, res) {

            var c = new errorComponents({debug: false});

            var e = new c.MissingParametersError("CUSTOM", "fields");
            c.handleError(e, req, res);

            return res;
        });
        request(app)
                .post('/')
                .expect('{\n  "error": "CUSTOM"\n}')
                .expect(400, done);
    })



    it("should handle NotFoundError default error", function(done) {

        var app = express();
        app.use(function(req, res) {

            var c = new errorComponents({debug: false});

            var e = new c.NotFoundError("", "fields");
            c.handleError(e, req, res);

            return res;
        });
        request(app)
                .post('/')
                .expect('{\n  "error": "NOT_FOUND"\n}')
                .expect(404, done);
    })


    it("should handle NotFoundError with custom message", function(done) {

        var app = express();
        app.use(function(req, res) {

            var c = new errorComponents({debug: false});

            var e = new c.NotFoundError("CUSTOM", "fields");
            c.handleError(e, req, res);

            return res;
        });
        request(app)
                .post('/')
                .expect('{\n  "error": "CUSTOM"\n}')
                .expect(404, done);
    })



    it("should handle AccessDeniedError default error", function(done) {

        var app = express();
        app.use(function(req, res) {

            var c = new errorComponents({debug: false});

            var e = new c.AccessDeniedError("", "fields");
            c.handleError(e, req, res);

            return res;
        });
        request(app)
                .post('/')
                .expect('{\n  "error": "NOT_ALLOWED"\n}')
                .expect(403, done);
    })


    it("should handle AccessDeniedError with custom message", function(done) {

        var app = express();
        app.use(function(req, res) {

            var c = new errorComponents({debug: false});

            var e = new c.AccessDeniedError("CUSTOM", "fields");
            c.handleError(e, req, res);

            return res;
        });
        request(app)
                .post('/')
                .expect('{\n  "error": "CUSTOM"\n}')
                .expect(403, done);
    })



    it("should handle default Error", function(done) {

        var app = express();
        app.use(function(req, res) {

            var c = new errorComponents({debug: false});

            var e = new Error("AAAA");
            c.handleError(e, req, res);

            return res;
        });
        request(app)
                .post('/')
                .expect('{\n  "error": "AAAA"\n}')
                .expect(400, done);
    })


    it("should handle default Error with custom statusCode", function(done) {

        var app = express();
        app.use(function(req, res) {

            var c = new errorComponents({debug: false});

            var e = new Error("AAAA");
            e.statusCode = 408;
            c.handleError(e, req, res);

            return res;
        });
        request(app)
                .post('/')
                .expect('{\n  "error": "AAAA"\n}')
                .expect(408, done);
    })


    it("should handle ReferenceError", function(done) {

        var app = express();
        app.use(function(req, res) {

            var c = new errorComponents({debug: false});
            try {
                console.log(vars / 0);
            } catch (e) {
                c.handleError(e, req, res);
            }

            return res;
        });
        request(app)
                .post('/')
                .expect('{\n  "error": "vars is not defined"\n}')
                .expect(500, done);
    })

});