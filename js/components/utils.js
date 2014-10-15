var util = require('util');
var _ = require('underscore');

module.exports = {
    errorsToString: function(error) {
        if (_.isArray(error)) {
            return _.map(error, module.exports.errorsToString);
        } else if (_.isString(error)) {
            return error;
        } else if (util.isError(error)) {
            return error.message;
        }
        return error;
    },
    generator: function(length) {
        return require('crypto').randomBytes(length).toString('hex');
    },
    isPromise: function(obj) {
        return (typeof obj == "object") && (typeof obj.then == "function") && obj.constructor && (obj.constructor.name == 'Promise');
    }
}
