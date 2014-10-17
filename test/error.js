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



describe('#handleError', function() {




    it("should handle NotFoundError default error", function(done) {

        var app = express();
        app.use(function(req, res) {

            var c = new errorComponents({debug: false});

            var e = new c.NotFoundError("", "user", "1");
            c.handleError(e, req, res);

            return res;
        });
        request(app)
                .post('/')
                .expect(function(res) {

                    if (!('date' in res.body))
                        return "missing date key";

                    if (!('details' in res.body))
                        return "missing details key";

                    if (!('error' in res.body))
                        return "missing error key";

                    if (res.body.error != "NOT_FOUND")
                        return "error key invalid";

                    if (res.body.statusCode != "404")
                        return "status code key invalid";
                })
                .expect(404, done);
    })


    it("should handle NotFoundError with custom message", function(done) {

        var app = express();
        app.use(function(req, res) {

            var c = new errorComponents({debug: false});

            var e = new c.NotFoundError("CUSTOM", "user", "1");
            c.handleError(e, req, res);

            return res;
        });
        request(app)
                .post('/')
                .expect(function(res) {

                    if (!('date' in res.body))
                        return "missing date key";

                    if (!('details' in res.body))
                        return "missing details key";

                    if (!('error' in res.body))
                        return "missing error key";

                    if (res.body.error != "CUSTOM")
                        return "error key invalid";

                    if (res.body.statusCode != "404")
                        return "status code key invalid";
                })
                .expect(404, done);
    })



    it("should handle AccessDeniedError default error", function(done) {

        var app = express();
        app.use(function(req, res) {

            var c = new errorComponents({debug: false});

            var e = new c.AccessDeniedError("", "you can not make this action");
            c.handleError(e, req, res);

            return res;
        });
        request(app)
                .post('/')
                .expect(function(res) {

                    if (!('date' in res.body))
                        return "missing date key";

                    if (!('details' in res.body))
                        return "missing details key";

                    if (!('error' in res.body))
                        return "missing error key";

                    if (res.body.error != "NOT_ALLOWED")
                        return "error key invalid";

                    if (res.body.statusCode != "403")
                        return "status code key invalid";
                })
                .expect(403, done);
    })


    it("should handle AccessDeniedError with custom message", function(done) {

        var app = express();
        app.use(function(req, res) {

            var c = new errorComponents({debug: false});

            var e = new c.AccessDeniedError("CUSTOM", "you can not make this action");
            c.handleError(e, req, res);

            return res;
        });
        request(app)
                .post('/')
                .expect(function(res) {

                    if (!('date' in res.body))
                        return "missing date key";

                    if (!('details' in res.body))
                        return "missing details key";

                    if (!('error' in res.body))
                        return "missing error key";

                    if (res.body.error != "CUSTOM")
                        return "error key invalid";

                    if (res.body.statusCode != "403")
                        return "status code key invalid";
                })
                .expect(403, done);
    })



    it("should handle default Error", function(done) {

        var app = express();
        app.use(function(req, res) {

            var c = new errorComponents({debug: false});

            var e = new Error("foo");
            c.handleError(e, req, res);

            return res;
        });
        request(app)
                .post('/')
                .expect(function(res) {

                    if (!('date' in res.body))
                        return "missing date key";

                    if (!('details' in res.body))
                        return "missing details key";

                    if (!('error' in res.body))
                        return "missing error key";

                    if (res.body.error != "foo")
                        return "error key invalid";

                    if (res.body.statusCode != "500")
                        return "status code key invalid";
                })
                .expect(500, done);
    })


    it("should handle default Error with custom statusCode", function(done) {

        var app = express();
        app.use(function(req, res) {

            var c = new errorComponents({debug: false});

            var e = new Error("foo");
            e.statusCode = 408;
            c.handleError(e, req, res);

            return res;
        });
        request(app)
                .post('/')
                .expect(function(res) {

                    if (!('date' in res.body))
                        return "missing date key";

                    if (!('details' in res.body))
                        return "missing details key";

                    if (!('error' in res.body))
                        return "missing error key";

                    if (res.body.error != "foo")
                        return "error key invalid";

                    if (res.body.statusCode != "408")
                        return "status code key invalid";
                })
                .expect(408, done);
    })



    it("should handle default Error with custom statusCode and details", function(done) {

        var app = express();
        app.use(function(req, res) {

            var c = new errorComponents({debug: false});

            var e = new Error("foo");
            e.statusCode = 409;
            e.details = "bar"
            c.handleError(e, req, res);

            return res;
        });
        request(app)
                .post('/')
                .expect(function(res) {

                    if (!('date' in res.body))
                        return "missing date key";

                    if (!('details' in res.body))
                        return "missing details key";

                    if (!('error' in res.body))
                        return "missing error key";

                    if (res.body.error != "foo")
                        return "error key invalid";

                    if (res.body.statusCode != "409")
                        return "status code key invalid";

                    if (res.body.details != "bar")
                        return "details invalid";
                })
                .expect(409, done);
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
                .expect(function(res) {

                    if (!('date' in res.body))
                        return "missing date key";

                    if (!('details' in res.body))
                        return "missing details key";

                    if (!('error' in res.body))
                        return "error is not defined";

                    if (res.body.error != "vars is not defined")
                        return "error key invalid";

                    if (res.body.statusCode != "500")
                        return "status code key invalid";
                })
                .expect(500, done);
    })
});