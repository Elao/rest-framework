var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

var utilsComponent = require("../js/components/utils.js")

var should = require('chai').should(),
        expect = require('chai').expect,
        assert = require('chai').assert;

var PromiseBlueBird = require('bluebird');
var _ = require('lodash');

var express = require('express');
var request = require('supertest');

var Promise = require('promise');
var PromiseNode = require('node-promise').Promise;
var when = require('when');
var Q = require('Q');

describe('Utils components test ', function() {

    describe("#isPromise", function() {

        it('should return false with simple object', function() {
            var promise = {};
            var res = utilsComponent.isPromise(promise);
            return assert.notOk(res, 'simple object are reconized as promise !')
        });

        /*it('should return false with object thenable', function() {
         var promise = {};
         promise.then = function() {
         
         }
         
         var res = utilsComponent.isPromise(promise);
         return assert.notOk(res, 'simple object are reconized as promise !')
         });*/


        it('should return false with simple function', function() {
            var promise = new function() {
            }

            var res = utilsComponent.isPromise(promise);
            return assert.notOk(res, 'simple function are reconized as promise !')
        });



        it('should return true with bluebird promise', function() {

            var promise = new PromiseBlueBird(function(resolve, reject) {
            });

            var res = utilsComponent.isPromise(promise);
            return assert.ok(res, 'bluebird promise is not a ... promise.')
        });

        it('should return true with "promise"', function() {

            var promise = new Promise(function(resolve, reject) {
            });

            var res = utilsComponent.isPromise(promise);
            return assert.ok(res, '"promise" is not a ... promise.')
        });


        it('should return true with "node-promise"', function() {

            var promise = new PromiseNode(function(resolve, reject) {
            });

            var res = utilsComponent.isPromise(promise);
            return assert.ok(res, '"node-promise" is not a ... promise.')
        });

        it('should return true with "when"', function() {

            var promise = new when(function(resolve, reject) {
            });

            var res = utilsComponent.isPromise(promise);
            return assert.ok(res, '"node-promise" is not a ... promise.')
        });


        it('should return true with "q"', function() {

            var deferred = Q.defer();
            var promise = deferred.promise;

            var res = utilsComponent.isPromise(promise);
            return assert.ok(res, '"node-promise" is not a ... promise.')
        });

    })
})