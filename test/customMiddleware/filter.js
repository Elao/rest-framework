"use strict";

var Promise = require('bluebird');
var _ = require('lodash');


module.exports = {
    name: 'filterWithId',
    config: {
        authorisedId: ["1", "2"]
    },
    middleware: function(config, req, res) {
        return new Promise(function(resolve, reject) {
            if (_.contains(config.authorisedId, req.query.id)) {
                resolve();
            } else {
                return reject();
            }
        });
    }

}