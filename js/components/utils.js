var util  = require('util');
var _     = require('underscore');

module.exports = {
    errorsToString: function(error) {
        if (_.isArray(error)) {
            return _.map(error, module.exports.errorsToString);
        } else if (_.isString(error)) {
            return error;
        } else if (util.isError(error)) {
            if (error instanceof TypeError || error instanceof ReferenceError) {
                console.log(error.stack);
            }
            return error.message;
        } else {
            console.log(error.constructor.name);
        }
        return error;
    },
    generator: function(length) {
        return require('crypto').randomBytes(length).toString('hex');
    }
}
