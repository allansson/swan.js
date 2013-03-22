(function (global) {
    "use strict";

    function complexTypeEvaluator(mixins, signature) {
        function evaluateMixins(val, mixins) {
            var i = 0;

            for(i = 0; i < mixins.length; ++i) {
                if(!swan.is(val, mixins[i])) {
                    return false;
                }
            }

            return true;
        }

        function evaluateSignature(val, signature) {
            var prop = null;

            for(prop in signature) {
                if(signature.hasOwnProperty(prop)) {
                    if(!swan.is(val[prop], signature[prop])) {
                        return false;
                    }
                }
            }

            return true;
        }

        return function(val) {
            return evaluateSignature(val, signature) && evaluateMixins(val, mixins);
        };
    }

    var definitions = {},
        swan = function(val) {

            return {
                expect: function(archetypeN) {
                    swan.expect(val, archetypeN);
                },
                is: function(archetypeN) {
                    return swan.is(val, archetypeN);
                },
                as: function(archetypeN) {
                    return swan.as(val, archetypeN);
                }
            };
        };

    swan.define = function(archetype, definition) {
        var i = 0,
            mixins = null,
            signature = null,
            evaluator = null,
            
            prop = null;

        if(!swan.is(definitions[archetype], 'undefined')) {
            throw new Error("An archetype with name '" + archetype + "' already exists.");
        }

        if(!swan.is(archetype, 'string')) {
            throw new Error('Argument archetype must be of type string.');
        }

        if(swan.is(definition, 'array')) {
            definition = {
                mixins: definition
            };
        }

        if(swan.is(definition, 'function')) {
            definition = {
                evaluator: definition
            }
        }

        if(swan.is(definition, 'object') && swan.is(definition.mixins, 'undefined') && swan.is(definition.signature, 'undefined') && swan.is(definition.evaluator, 'undefined')) {
            definition = {
                signature: definition
            };
        }

        if(!swan.is(definition, 'object')) {
            throw new Error("Argument 'definition' must be a definition object, a plain object, an array of mixins or an evaluator function.");
        }

        mixins = definition.mixins || [];
        signature = definition.signature || {};
        evaluator = definition.evaluator;

        if(swan.is(mixins, 'string')) {
            mixins = [mixins];
        } else if (!swan.is(mixins, 'array')) {
            throw new Error("Property 'mixins' must be an array or a string.");
        }
        
        if(!swan.is(signature, 'object')) {
            throw new Error("Property 'signature' must be a map.")
        }

        if(!evaluator) {
            for(prop in signature) {
                if(signature.hasOwnProperty(prop)) {
                    if(swan.is(signature[prop], 'array')) {
                        for(i = 0; i < signature[prop].length; ++i) {
                            if(!swan.is(signature[prop[i]], 'string')) {
                                throw new Error("Array in property '" + prop + "' of 'signature' may only contain strings.");
                            }
                        }
                    } else if(!swan.is(signature[prop], 'string')) {
                        throw new Error("Property '" + prop + "' of 'signature' must be a string or an array of strings.")
                    }
                }
            }

            evaluator = complexTypeEvaluator(mixins, signature);
        }

        if(!swan.is(evaluator, 'function')) {
            throw new Error("Property 'evaluator' must be a function.");
        }

        definitions[archetype] = {
            mixins: mixins,
            signature: signature,
            evaluator: evaluator
        };
    }

    swan.globalize = function(toggle) {
        if(swan.is(toggle, 'undefined')) {
            toggle = true;
        }

        if(toggle) {
            if(swan.is(Object.prototype.is, 'undefined')) {
                Object.defineProperty(Object.prototype, "is", {
                    value: function(archetypeN) {
                        return swan.is(this, archetypeN);
                    },
                    configurable: true,
                    writable: false,
                    enumerable: false
                });
            }

            if(swan.is(Object.prototype.as, 'undefined')) {
                Object.defineProperty(Object.prototype, "as", {
                    value: function(archetypeN) {
                        return swan.as(this, archetypeN);
                    },
                    configurable: true,
                    writable: false,
                    enumerable: false
                });
            }

            if(swan.is(Object.prototype.expect, 'undefined')) {
                Object.defineProperty(Object.prototype, "expect", {
                    value: function(archetype, errMsg) {
                        return swan.expect(this, archetype, errMsg);
                    },
                    configurable: true,
                    writable: false,
                    enumerable: false
                });
            }
        } else {
            if(swan.is(Object.prototype.is, 'function')) {
                delete Object.prototype.is;
            }

            if(swan.is(Object.prototype.as, 'function')) {
                delete Object.prototype.as;
            }

            if(swan.is(Object.prototype.expect, 'function')) {
                delete Object.prototype.expect;
            }
        }
    };

    swan.use

    swan.expect = function(val, archetype, errMsg) {
        if(!swan.is(val, archetype)) {
            throw new Error(errMsg || "Expected value to be of archetype '" +  archetype + "'.");
        }
    };

    swan.is = function(val, archetypeN) {
        var i = 0,
            definition = null;

        for(i = 1; i < arguments.length; i += 1) {
            definition = definitions[arguments[i]];

            if(!definition) {
                throw new Error("Archetype '" + arguments[i] + "' does not exist. An archetype has to be defined before it can be used.");
            }

            if(!definition.evaluator(val)) {
                return false;
            }
        }

        return true;
    };

    swan.as = function(val, archetypeN) {
        var i = 1,
            proxy = {};

        function functionProxy(self, f) {
            return function() {
                return f.call(self, arguments);
            };
        }

        function writeProperties(val, signature, target) {
            var prop = null;

            for(prop in signature) {
                if(signature.hasOwnProperty(prop)) {
                    if(target.hasOwnProperty(prop)) {
                        continue;
                    }

                    if(!swan.is(val[prop], signature[prop])) {
                        return null;
                    }

                    if(signature[prop] === 'function') {
                        target[prop] = functionProxy(val, val[prop]);
                    } else {
                        target[prop] = val[prop];
                    }
                }
            }

            return target;
        }

        function mergeMixins(val, mixins, target) {
            var i = 0;

            for(i = 0; i < mixins.length; i += 1) {
                try {
                    if(!buildProxy(val, mixins[i], target)) {
                        return null;
                    }
                } catch(err) {
                    throw new Error("Failed to infer extending archetype '" + mixins[i] + "'. Reason was: " + err.message);
                }
            }
        }

        function buildProxy(val, archetype, target) {
            var definition = definitions[archetype];

            target = target || {};

            if(!definition) {
                throw new Error("Archetype '" + definition + "' does not exist. An archetype has to be defined before it can be used.")
            }

            if(definition.signature && !writeProperties(val, definition.signature, target)) {
                return null;
            }

            mergeMixins(val, definition.mixins, target);

            return target;
        }

        for(i = 1; i < arguments.length; i += 1) {
            if(!buildProxy(val, arguments[i], proxy)) {
                return null;
            }
        }

        return proxy;
    };

    swan.reset = function() {
        definitions = {
            "any": {
                mixins: [],
                signature: {},
                evaluator: function(val) {
                    return true;
                }
            },
            "object": {
                mixins: [],
                signature: {},
                evaluator: function(val) {
                    return typeof(val) === 'object';
                }
            },
            "string": {
                mixins: [],
                signature: {},
                evaluator: function(val) {
                    return typeof(val) === 'string';
                }
            },
            "number": {
                mixins: [],
                signature: {},
                evaluator: function(val) {
                    return typeof(val) === 'number';
                }
            },
            "boolean": {
                mixins: [],
                signature: {},
                evaluator: function(val) {
                    return typeof(val) === 'boolean';
                }
            },
            "undefined": {
                mixins: [],
                signature: {},
                evaluator: function(val) {
                    return typeof(val) === 'undefined';
                }
            },
            "array": {
                mixins: [],
                signature: {},
                evaluator: (function() {
                    var toStr = Object.prototype.toString,
                        arrayStr = toStr.call([]);

                    return function(val) {
                        return toStr.call(val) === arrayStr;
                    };
                }())
            },
            "function": {
                mixins: [],
                signature: {},
                evaluator: function(val) {
                    return typeof(val) === 'function';
                }
            }
        };
    };

    swan.reset();
    global.swan = swan;
}(this));