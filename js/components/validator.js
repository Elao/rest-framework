(function() {
    var ruleBasedValidator = {};

    // private variables
    var regularExpressions = {
            email: /^[a-zA-Z0-9+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/,
            url: /^(http(?:s)?\:\/\/[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/,
            integer: /^(?:-?(?:0|[1-9][0-9]*))$/,
            decimal: /^(?:-?(?:0|[1-9][0-9]*))?(?:\.[0-9]*)?$/,
            isIPAddress: /^\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}$/,
            USPhoneNumber: /^[\(]?[0-9]{3}[\)]?[ -\.,]?[0-9]{3}[ -\.,]?[0-9]{4}$/,
            USZipCode: /^\d{5}$|^\d{5}-\d{4}$/
        };
    var AllowedBoolStrings = 'true,false,yes,no,1,0';

    var ruleHandlers = {
        required: function(fieldName, data, ruleValue) {
            if (ruleValue && (!Exists(data) || data === ''))
                return false;

            return true;
        },

        type: function(fieldName, data, ruleValue) {
            if (!Exists(data))
                return true;

            if (typeof(data) !== ruleValue && ruleValue !== 'array')
                return false;

            if(ruleValue === 'array' && Object.prototype.toString.call(data) !== '[object Array]' )
                return false;

            return true;
        },

        isArray: function(fieldName, data, ruleValue) {
            if (!ruleValue || !Exists(data))
                return true;

            return ruleHandlers.type(fieldName, data, 'array');
        },

        minLength: function(fieldName, data, ruleValue) {
            if (Exists(data)) {
                if (Object.prototype.toString.call(data) === '[object Array]' || typeof(data) === 'string')
                    return data.length >= ruleValue;

                return false;
            }

            return true;
        },

        maxLength: function(fieldName, data, ruleValue) {
            if (Exists(data)) {
                if (Object.prototype.toString.call(data) === '[object Array]' || typeof(data) === 'string')
                    return data.length <= ruleValue;

                return false;
            }

            return true;
        },

        minValue: function(fieldName, data, ruleValue) {
            if (Exists(data)) {
                if (typeof(data) === 'number')
                    return data >= ruleValue;

                return false;
            }

            return true;
        },

        maxValue: function(fieldName, data, ruleValue) {
            if (Exists(data)) {
                if (typeof(data) === 'number')
                    return data <= ruleValue;

                return false;
            }

            return true;
        },

        isInt: function(fieldName, data, ruleValue) {
            if (!ruleValue || !Exists(data))
                return true;

            return ruleHandlers.regex(fieldName, data, regularExpressions.integer);
        },

        isDecimal: function(fieldName, data, ruleValue) {
            if (!ruleValue || !Exists(data))
                return true;

            return ruleHandlers.regex(fieldName, data, regularExpressions.decimal);
        },

        isBool: function(fieldName, data, ruleValue) {
            if (!ruleValue || !Exists(data))
                return true;

            if (typeof(data) == 'boolean')
                return true;
            else if (typeof(data) == 'string' && AllowedBoolStrings.indexOf(data.toString().toLowerCase()) != -1)
                return true;
            else
                return false;
        },

        isUrl: function(fieldName, data, ruleValue) {
            if (!ruleValue || !Exists(data))
                return true;

            return ruleHandlers.regex(fieldName, data, regularExpressions.url);
        },

        isEmail: function(fieldName, data, ruleValue) {
            if (!ruleValue || !Exists(data))
                return true;

            return ruleHandlers.regex(fieldName, data, regularExpressions.email);
        },

        isIPAddress: function(fieldName, data, ruleValue) {
            if (!ruleValue || !Exists(data))
                return true;

            return ruleHandlers.regex(fieldName, data, regularExpressions.isIPAddress);
        },

        isUSPhoneNumber: function(fieldName, data, ruleValue) {
            if (!ruleValue || !Exists(data))
                return true;

            return ruleHandlers.regex(fieldName, data, regularExpressions.USPhoneNumber);
        },

        isUSZipCode: function(fieldName, data, ruleValue) {
            if (!ruleValue || !Exists(data))
                return true;

            return ruleHandlers.regex(fieldName, data, regularExpressions.USZipCode);
        },

        hasValue: function(fieldName, data, ruleValue) {
            return (data === ruleValue);
        },

        inList: function(fieldName, data, ruleValue) {
            if (!ruleValue || typeof ruleValue.indexOf !== 'function') {
                return false;
            }
            if (Array.isArray(ruleValue)) {
                ruleValue = ruleValue.map(String);
            }
            return ruleValue.indexOf(data) >= 0;
        },

        dependsOn: function(fieldName, fieldValue, ruleValue, data) {
            var dependsOnProp = data[ruleValue.propName];

            if (typeof(dependsOnProp) !== 'undefined' && dependsOnProp.toString() == ruleValue.propValue) {
                return ruleBasedValidator.validateField(fieldName, fieldValue, ruleValue.rules);
            }

            return true;
        },

        regex: function(fieldName, data, ruleValue) {
            if (Exists(data)) {
                if (Object.prototype.toString.call(ruleValue) === "[object RegExp]")
                    return ruleValue.test(data);
            }

            return true;
        },

        notRegex: function(fieldName, data, ruleValue) {
            if (!Exists(data))
                return true;

            return !ruleHandlers.regex(fieldName, data, ruleValue);
        }
    }

    // private functions
    function Exists(data) {
        return (data !== null && typeof(data) !== 'undefined');
    }

    function applyContentRules(fieldName, fieldValue, contentRules, data) {
        if (!Exists(contentRules) || !Exists(fieldValue))
            return true;

        var errors = new Array();
        var errMsg = null;
        if (Exists(contentRules['message']))
            errMsg = contentRules['message'];

        var result;

        for (var index=0; index<fieldValue.length; index++) {
            if (typeof(fieldValue[index]) === 'object') {
                result = ruleBasedValidator.validate(fieldValue[index], contentRules);
            } else {
                result = ruleBasedValidator.validateField(fieldName, fieldValue[index], contentRules, data);
            }

            if (result !== true) {
                if (typeof(result) === 'object') {
                    errors.concat(result);
                    for (var i=0; i<result.length; i++)
                        errors.push(result[i]);
                } else {
                    errors.push({
                        fieldName: fieldName,
                        fieldValue: fieldValue[index],
                        ruleName: ruleName,
                        errorMessage: errMsg || (fieldName + "'s element [" + fieldValue[index] + "] is invalid.")
                    });
                }

                if (ruleBasedValidator.stopOnFirstError)
                    break;
            }
        }

        if (errors.length > 0)
            return errors;

        return true;

    }

    function BuildFieldRules(currentFieldRules, groupRules, groupName) {
        var groups = groupRules['groups'];
        var grpRules = groupRules['rules'];

        for (var ruleName in grpRules) {
            if (!!~ruleValue.indexOf(groupName))
                currentFieldRules[ruleName] = grpRules[ruleName];
        }

        return currentFieldRules;
    }

    function findField(data, ruleName) {
        var pos = ruleName.indexOf(ruleBasedValidator.hierarchyIndicator);

        if (pos != -1) {
            var propName = ruleName.substring(0, pos);

            if (!Exists(data[propName]))
                return { name: propName, data: null };

            if (ruleName.length > pos)
                return findField(data[propName], ruleName.substring(pos+1));
        } else {
            return { name: ruleName, data: data[ruleName] };
        }
    }

    // public properties
    ruleBasedValidator.stopOnFirstError = false;
    ruleBasedValidator.hierarchyIndicator = '_';

    // public functions
    ruleBasedValidator.validateField = function(fieldName, fieldValue, fieldRules, data, groupName) {
        if (!Exists(fieldRules))
            return true;

        var errors = new Array();
        var errMsg = null;

        if (Exists(fieldRules['message']))
            errMsg = fieldRules['message'];
        if (Exists(fieldRules['groupRules']))
            fieldRules = BuildFieldRules(fieldRules, fieldRules['groupRules'], groupName);

        var result;

        for (var ruleName in fieldRules) {
            if (ruleName !== 'message') {
                var ruleValue = fieldRules[ruleName];
                var ruleGrp = null;
                var ruleErrMsg = errMsg;

                // if rule has an error message then use that message instead
                if (typeof(ruleValue) === 'object') {
                    if (Exists(ruleValue['group']))
                        ruleGrp = ruleValue['group'];
                    if (Exists(ruleValue['message']))
                        ruleErrMsg = ruleValue['message'];
                    if (Exists(ruleValue['value']))
                        ruleValue = ruleValue['value'];
                }

                // if group is specified on the rule, apply it if matches the groupName else skip it
                if (groupName != null && groupName.length > 0 && ruleGrp != null && ruleGrp.length > 0 && !!~ruleGrp.indexOf(groupName) === false)
                    continue;

                if (ruleName === 'contentRules')
                    result = applyContentRules(fieldName, fieldValue, ruleValue, data);
                else if (ruleName === 'customAction') {
                    result = ruleValue(fieldName, fieldValue, data);
                }
                else {
                    var ruleHandler = ruleHandlers[ruleName];
                    result = ruleHandler(fieldName, fieldValue, ruleValue, data);
                }

                if (result !== true) {
                    if (typeof(result) === 'object') {
                        errors.concat(result);
                        for (var i=0; i<result.length; i++)
                            errors.push(result[i]);
                    } else {
                        errors.push({
                            fieldName: fieldName,
                            fieldValue: fieldValue,
                            ruleName: ruleName,
                            errorMessage: ruleErrMsg || (fieldName + ' is ' + (ruleName=='required' ? ruleName : 'invalid.'))
                        });
                    }

                    if (ruleBasedValidator.stopOnFirstError)
                        break;
                }
            }
        }

        if (errors.length > 0)
            return errors;

        return true;
    }

    ruleBasedValidator.validate = function(data, rules, groupName) {
        var errors = new Array();
        var result;
        var skipCriteria = null;

        for (var ruleName in rules) {
            var field = findField(data, ruleName);

            if (ruleName.match(skipCriteria))
                continue;

            result = ruleBasedValidator.validateField(field.name, field.data, rules[ruleName], data, groupName);

            if (result !== true) {
                skipCriteria = ruleName + ruleBasedValidator.hierarchyIndicator;
                for (var i=0; i<result.length; i++)
                    errors.push(result[i]);

                if (ruleBasedValidator.stopOnFirstError)
                    break;
            }
        }

        if (errors.length > 0)
            return errors;

        return true;
    }

    if (typeof(module) !== 'undefined' && module.exports) {
        module.exports = ruleBasedValidator;
    } else if (typeof(define) !== 'undefined') {
        define(function() {
            return ruleBasedValidator;
        });
    } else {
        this.ruleBasedValidator = ruleBasedValidator;
    }
}());
