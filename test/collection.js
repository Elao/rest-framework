var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

var collection = require("../js/components/collection.js")

var should = require('chai').should(),
        expect = require('chai').expect,
        assert = require('chai').assert;

var Promise = require('bluebird');

var _ = require('lodash');

describe('Collection basic', function() {
    var c = new collection();

    it('should "collection" has good signature', function() {
        return assert.typeOf(collection, 'function', 'collection is not a function')
    });

    it('should "collection" has mandatory method', function() {

        expect(c).to.respondTo('resolvePagination');
        expect(c).to.respondTo('generateLinks');
        expect(c).to.respondTo('generateTimestampLinks');
        expect(c).to.respondTo('generateFirebaseLinks');
        expect(c).to.respondTo('returnCollection');
        expect(c).to.respondTo('returnCollectionTimestamp');
        expect(c).to.respondTo('returnCollectionFirebase');
    });
})


describe('Collection Usage', function() {
    var c = new collection();

    describe("#resolvePagination", function() {

        it('should failed if called without req.query', function() {
            var badPromise = c.resolvePagination({}, 1);
            badPromise.should.be.rejected;
        });

        it('should return default pagination object ', function() {
            var count = 30;
            var goodPromise = c.resolvePagination({query: {}}, count);

            goodPromise.should.be.fullfiled;

            return assert.becomes(goodPromise, {
                "before": null,
                "count": count,
                "lastPage": 3,
                "limit": 10,
                "offset": 0,
                "page": 1,
                "since": null,
                "until": null
            }, "Bad structure");
        });


        it('should return a good pagination object with limit overrided at 100', function() {
            var count = 30;
            var goodPromise = c.resolvePagination({query: {limit: "100"}}, count);
            return assert.becomes(goodPromise, {
                "before": null,
                "since": null,
                "until": null,
                "count": count,
                "lastPage": 1,
                "limit": 100,
                "offset": 0,
                "page": 1,
            }, "Bad structure");
        });

        it('should return a default pagination object with bad limit parameters "aa" ', function() {
            var count = 30;
            var goodPromise = c.resolvePagination({query: {limit: "aa"}}, count);
            return assert.becomes(goodPromise, {
                "before": null,
                "since": null,
                "until": null,
                "count": count,
                "lastPage": 3,
                "limit": 10,
                "offset": 0,
                "page": 1,
            }, "Bad structure");
        });

        it('should return a default pagination object with bad page parameters "aa" ', function() {
            var count = 30;
            var goodPromise = c.resolvePagination({query: {page: "aa"}}, count);
            return assert.becomes(goodPromise, {
                "before": null,
                "since": null,
                "until": null,
                "count": count,
                "lastPage": 3,
                "limit": 10,
                "offset": 0,
                "page": 1,
            }, "Bad structure");
        });

        it('should return a good pagination object with good page parameters ', function() {
            var count = 30;
            var goodPromise = c.resolvePagination({query: {page: "2"}}, count);
            return assert.becomes(goodPromise, {
                "before": null,
                "since": null,
                "until": null,
                "count": count,
                "lastPage": 3,
                "limit": 10,
                "offset": 10,
                "page": 2,
            }, "Bad structure");
        });

        it('should return last pagination object bad page parameters (> lastPage) ', function() {
            var count = 30;
            var goodPromise = c.resolvePagination({query: {page: "40"}}, count);
            return assert.becomes(goodPromise, {
                "before": null,
                "since": null,
                "until": null,
                "count": count,
                "lastPage": 3,
                "limit": 10,
                "offset": 20,
                "page": 3,
            }, "Bad structure");
        });
    });


    describe("#generateLinks", function() {

        var req = {
            protocol: "http",
            "originalUrl": "",
            "get": function(e) {
                return "localhost";
            }
        };

        it('should return default pagination object ', function(done) {
            var count = 30;

            var goodPromise = c.resolvePagination({query: {}}, count);
            goodPromise.then(function(pagination) {
                var goodPromise = c.generateLinks(req, pagination);
                assert.becomes(goodPromise, {
                    "first": "http://localhost/?page=1&limit=10",
                    "last": "http://localhost/?page=3&limit=10",
                    "next": "http://localhost/?page=2&limit=10",
                    "current": "http://localhost/?page=1&limit=10"
                }, "Bad structure").then(done, done);
            })
        });
        it('should return good pagination object with prev page when we follow next link', function(done) {
            var count = 30;

            var goodPromise = c.resolvePagination({query: {page: 2}}, count);
            goodPromise.then(function(pagination) {
                var goodPromise = c.generateLinks(req, pagination);
                assert.becomes(goodPromise, {
                    "first": "http://localhost/?page=1&limit=10",
                    "last": "http://localhost/?page=3&limit=10",
                    "prev": "http://localhost/?page=1&limit=10",
                    "next": "http://localhost/?page=3&limit=10",
                    "current": "http://localhost/?page=2&limit=10"
                }, "Bad structure").then(done, done);
            })
        });


        it('should return good pagination object with prev page and without next when reach ending ', function(done) {
            var count = 30;

            var goodPromise = c.resolvePagination({query: {page: 5}}, count);
            goodPromise.then(function(pagination) {
                var goodPromise = c.generateLinks(req, pagination);
                assert.becomes(goodPromise, {
                    "first": "http://localhost/?page=1&limit=10",
                    "last": "http://localhost/?page=3&limit=10",
                    "prev": "http://localhost/?page=2&limit=10",
                    "current": "http://localhost/?page=3&limit=10"
                }, "Bad structure").then(done, done);
            })
        });

        it('should return good pagination object with limit override > count', function(done) {
            var count = 30;

            var goodPromise = c.resolvePagination({query: {limit: 40}}, count);
            goodPromise.then(function(pagination) {
                var goodPromise = c.generateLinks(req, pagination);
                assert.becomes(goodPromise, {
                    "first": "http://localhost/?page=1&limit=40",
                    "last": "http://localhost/?page=1&limit=40",
                    "current": "http://localhost/?page=1&limit=40"
                }, "Bad structure").then(done, done);
            })
        });

        it('should return good pagination object with existant query parameters in url', function(done) {
            var count = 30;
            var req = {
                "protocol": "http",
                "originalUrl": "?search=chaijs&test=mocha",
                "get": function(e) {
                    return "localhost";
                }
            };

            var goodPromise = c.resolvePagination({query: {}}, count);
            goodPromise.then(function(pagination) {
                var goodPromise = c.generateLinks(req, pagination);
                assert.becomes(goodPromise, {
                    "first": "http://localhost/?search=chaijs&test=mocha&page=1&limit=10",
                    "last": "http://localhost/?search=chaijs&test=mocha&page=3&limit=10",
                    "next": "http://localhost/?search=chaijs&test=mocha&page=2&limit=10",
                    "current": "http://localhost/?search=chaijs&test=mocha&page=1&limit=10"
                }, "Bad structure").then(done, done);
            })
        });


    });



    describe("#generateTimestampLinks", function() {

        var req = {
            protocol: "http",
            "originalUrl": "",
            "get": function(e) {
                return "localhost";
            }
        };
        var items = [
            {
                name: "dernier element",
                date: 10
            },
            {
                name: "element 4",
                date: 9
            },
            {
                name: "element 3",
                date: 8
            },
            {
                name: "element 2",
                date: 7
            },
            {
                name: "premier element",
                date: 6
            },
        ];
        var dateExtractor = "date";


        it('should return default pagination object ', function(done) {
            var count = 30;

            var goodPromise = c.resolvePagination({query: {limit: 2}}, 5);
            goodPromise.then(function(pagination) {
                var goodPromise = c.generateTimestampLinks(req, items.slice(0, 2), dateExtractor, pagination);
                assert.becomes(goodPromise, {
                    "last": "http://localhost/?limit=2&since=0&before=9",
                    "next": "http://localhost/?limit=2&before=9"
                }, "Bad structure").then(done, done);
            })
        });

        it('should return default pagination object ', function(done) {
            var count = 30;
            var goodPromise = c.resolvePagination({query: {limit: 2, before: 9}}, 5);
            goodPromise.then(function(pagination) {
                var goodPromise = c.generateTimestampLinks(req, items.slice(2, 4), dateExtractor, pagination);
                assert.becomes(goodPromise, {
                    "first": "http://localhost/?limit=2&until=8",
                    "previous": "http://localhost/?limit=2&since=8",
                    "next": "http://localhost/?limit=2&before=7",
                    "last": "http://localhost/?limit=2&since=0&before=7",
                }, "Bad structure").then(done, done);
            })
        });
    });


    describe("#generateFirebaseLinks", function() {

        var req = {
            protocol: "http",
            "originalUrl": "",
            "get": function(e) {
                return "localhost";
            }
        };
        var items = [
            {
                name: "dernier element",
                date: 10
            },
            {
                name: "element 4",
                date: 9
            },
            {
                name: "element 3",
                date: 8
            },
            {
                name: "element 2",
                date: 7
            },
            {
                name: "premier element",
                date: 6
            },
        ];
        var dateExtractor = "date";


        it('should return only next link', function(done) {
            var count = 30;

            var goodPromise = c.resolvePagination({query: {limit: 2}}, 5);
            goodPromise.then(function(pagination) {
                var goodPromise = c.generateFirebaseLinks(req, items.slice(0, 2), dateExtractor, pagination);
                assert.becomes(goodPromise, {
                    "next": "http://localhost/?limit=2&before=9"
                }, "Bad structure").then(done, done);
            })
        });

        it('should return next / previous link ', function(done) {
            var count = 30;
            var goodPromise = c.resolvePagination({query: {limit: 2, before: 9}}, 5);
            goodPromise.then(function(pagination) {
                var goodPromise = c.generateFirebaseLinks(req, items.slice(2, 4), dateExtractor, pagination);
                assert.becomes(goodPromise, {
                    "previous": "http://localhost/?limit=2&since=8",
                    "next": "http://localhost/?limit=2&before=7",
                }, "Bad structure").then(done, done);
            })
        });

        it('should return only previous ', function(done) {
            var count = 30;
            var goodPromise = c.resolvePagination({query: {limit: 2, before: 9}}, 5);
            goodPromise.then(function(pagination) {
                var goodPromise = c.generateFirebaseLinks(req, items.slice(4), dateExtractor, pagination);
                assert.becomes(goodPromise, {
                    "previous": "http://localhost/?limit=2&since=6"
                }, "Bad structure").then(done, done);
            })
        });
    });


    describe("#returnCollection", function() {

        var req = {
            protocol: "http",
            "originalUrl": "",
            "get": function(e) {
                return "localhost";
            },
            "query": {
                limit: 2
            }
        };

        var items = [];
        for (var i = 1; i < 50; i++) {
            items.push({
                id: i,
                name: "item " + i
            })
        }

        it('should return valid structure ', function(done) {
            var count = 30;
            var countPromise = function() {
                return new Promise(function(resolve, reject) {
                    return resolve(count);
                });
            }

            var dataPromise = function(pagination) {
                return new Promise(function(resolve, reject) {
                    return resolve(items);
                });
            }

            var goodPromise = c.returnCollection(req, null, dataPromise, countPromise);
            assert.becomes(goodPromise, {
                "count": count,
                "items": items,
                "links": {
                    "current": "http://localhost/?page=1&limit=2",
                    "first": "http://localhost/?page=1&limit=2",
                    "last": "http://localhost/?page=15&limit=2",
                    "next": "http://localhost/?page=2&limit=2",
                }
            }, "Bad structure").then(done, done);
        });

        it('should failed if wrong parameters for data/count promise', function(done) {
            var count = 30;
            var data = [];

            var badPromise = c.returnCollection(req, null, "data", "count").then(function(e) {
                done(new Error("returnCollection must throw an error with wrong parameters"))
            }).catch(function(e) {
                done();
            });
        });
    });


    describe("#returnCollectionTimestamp", function() {

        var req = {
            protocol: "http",
            "originalUrl": "",
            "get": function(e) {
                return "localhost";
            },
            "query": {
                limit: 2
            }
        };

        var items = [];
        for (var i = 1; i < 50; i++) {
            items.push({
                id: i,
                name: "item " + i
            })
        }

        it('should return valid structure ', function(done) {
            var count = 30;
            var countPromise = function() {
                return new Promise(function(resolve, reject) {
                    return resolve(count);
                });
            }

            var dataPromise = function(pagination) {
                return new Promise(function(resolve, reject) {
                    return resolve(items);
                });
            }

            var goodPromise = c.returnCollectionTimestamp(req, null, dataPromise, countPromise, "id");
            assert.becomes(goodPromise, {
                "count": count,
                "items": items,
                "links": {
                    "last": "http://localhost/?limit=2&since=0&before=49",
                    "next": "http://localhost/?limit=2&before=49"
                }
            }, "Bad structure").then(done, done);
        });

        it('should failed if wrong parameters for data/count promise', function(done) {
            var count = 30;
            var data = [];

            c.returnCollectionTimestamp(req, null, "data", "count").then(function(e) {
                done(new Error("returnCollection must throw an error with wrong parameters"))
            }).catch(function(e) {
                done();
            });
        });
    });


    describe("#returnCollectionFirebase", function() {

        var req = {
            protocol: "http",
            "originalUrl": "",
            "get": function(e) {
                return "localhost";
            },
            "query": {
                limit: 2
            }
        };

        var items = [];
        for (var i = 1; i < 50; i++) {
            items.push({
                id: i,
                name: "item " + i
            })
        }

        it('should return valid structure ', function(done) {
            var count = 30;
            var countPromise = function() {
                return new Promise(function(resolve, reject) {
                    return resolve(count);
                });
            }

            var dataPromise = function(pagination) {
                return new Promise(function(resolve, reject) {
                    return resolve(items);
                });
            }

            var goodPromise = c.returnCollectionFirebase(req, null, dataPromise, countPromise, "id");
            assert.becomes(goodPromise, {
                "count": count,
                "items": items,
                "links": {
                    "next": "http://localhost/?limit=2&before=49"
                }
            }, "Bad structure").then(done, done);
        });

        it('should failed if wrong parameters for data/count promise', function(done) {
            var count = 30;
            var data = [];

            c.returnCollectionFirebase(req, null, "data", "count").then(function(e) {
                done(new Error("returnCollection must throw an error with wrong parameters"))
            }).catch(function(e) {
                done();
            });
        });
    });


})