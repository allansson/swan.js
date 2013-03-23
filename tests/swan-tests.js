describe('swan.js', function() {
    beforeEach(function() {
        swan.reset();
        swan.ecma5(false);
        swan.globalize(false);
    });

    describe('globalize', function() {
        it('should define a global function is() on all objects', function() {
            var obj = {};

            swan.globalize();

            obj.should.have.property('is');
            obj.is.should.be.a('function');
        });

        it('should define a global function as() on all objects', function() {
            var obj = {};

            swan.globalize();

            obj.should.have.property('is');
            obj.as.should.be.a('function');
        });

        it('should define a global function expect() on all objects', function() {
            var obj = {};

            swan.globalize();

            obj.should.have.property('is');
            obj.expect.should.be.a('function');
        });

        it('should remove global function is() when specifying false as parameter', function() {
             var obj = {};

            swan.globalize();
            swan.globalize(false);

            obj.should.not.have.property('is');
        });

        it('should remove global function as() when specifying false as parameter', function() {
            var obj = {};

            swan.globalize();
            swan.globalize(false);

            obj.should.not.have.property('is');
        });

        it('should remove global function expect() when specifying false as parameter', function() {
            var obj = {};

            swan.globalize();
            swan.globalize(false);

            obj.should.not.have.property('is');
        });
    });

    describe('primitive objects', function() {
        it('should match primitive archetype string', function() {
            var result = swan.is('my string', 'string');

            result.should.equal(true);
        });

        it('should match primitive archetype number', function () {
            var result = swan.is(10.0, 'number');

            result.should.equal(true);
        });

        it('should match primitive archetype object', function () {
            var result = swan.is({}, 'object');

            result.should.equal(true);
        });

        it('should match primitive archetype boolean', function () {
            var result = swan.is(true, 'boolean');

            result.should.equal(true);
        });

        it('should match primitive archetype array', function () {
            var result = swan.is(['string', 10], 'array');

            result.should.equal(true);
        });

        it('should match primitive archetype function', function () {
            var result = swan.is(function() {}, 'function');

            result.should.equal(true);
        });

        it('should match primitive archetype undefined', function () {
            var result = swan.is({}.undefinedProperty, 'undefined');

            result.should.equal(true);
        });
    });

    describe('complex type definition', function() {
        it('should register archetype when giving an evaluator function', function() {
            var result,
                obj = {
                prop: true
            };

            swan.define('evaluator_function_type', {
               evaluator: function() {
                   return obj.prop;
               }
            });

            result = swan.is(obj, 'evaluator_function_type');

            true.should.equal(result);
        });

        it('should register archetype when giving a signature', function() {
            var result,
                obj = {
                bool: true,
                str: 'string',
                func: function() {

                },
                array: []
            };

            swan.define('signature_type', {
                signature: {
                    bool: 'boolean',
                    str: 'string',
                    func: 'function',
                    array: 'array'
                }
            });

            result = swan.is(obj, 'signature_type');

            true.should.equal(result);
        });

        it('should register archetype with mixins', function() {
            var result,

                obj = {
                    bool: true,
                    str: 'string',
                    func: function() {

                    },
                    array: []
                };

            swan.define('mixin1', {
                str: 'string',
                array: 'array'
            });

            swan.define('mixin2', {
                bool: 'boolean',
                func: 'function'
            });

            swan.define('signature_type', {
                mixins: ['mixin1', 'mixin2']
            });

            result = swan.is(obj, 'signature_type');

            true.should.equal(result);
        });

        it('should register a pure mixin archetype when passing array as definition', function() {
            var result,
                obj = {
                    prop: true,
                    prop2: 'str',
                    ignored: function() {}
                };

            swan.define('mixin1', {
                signature: {
                    prop: 'boolean'
                }
            });

            swan.define('mixin2', {
                signature: {
                    prop2: 'string'
                }
            });

            swan.define('pure-mixin', ['mixin1', 'mixin2']);

            result = swan.is(obj, 'pure-mixin');

            true.should.equal(result);
        });

        it('should register a signature based archetype when passing a normal object as definition', function() {
            var result,
                obj = {
                    prop: true,
                    prop2: 'str',
                    ignored: function() {}
                };

            swan.define('obj', {
                prop: 'boolean',
                prop2: 'string'
            });

            result = swan.is(obj, 'obj');

            true.should.equal(result);
        });

        it('should register a evaluator archetype when passing function as definition', function() {
            var result,
                obj = {
                    prop: true,
                    prop2: 'str',
                    ignored: function() {}
                };

            swan.define('evaluator', function(val) {
                return swan.is(val['prop'], 'boolean');
            });

            result = swan.is(obj, 'evaluator');

            true.should.equal(result);
        });
    });

    describe('archetype casting', function() {
        it('should return an object exposing only the archetype members', function() {
            var result,
                obj = {
                    bool: true,
                    str: 'my string',
                    ignored: function() {}
                };

            swan.define('MyArchetype', {
                signature: {
                    bool: 'boolean',
                    str: 'string'
                }
            });

            result = swan.as(obj, 'MyArchetype');

            if(expect(result).not.to.be.null) {}
            result.should.have.property('bool');
            result.should.have.property('str');
            result.should.not.have.property('ignored');
        });

        it('should modify original object when using function on proxy', function() {
            var proxy,
                obj = {
                    modified: false,
                    func: function() {
                        this.modified = true;
                    }
                };

            swan.define('MyArchetype', {
                signature: {
                    func: 'function'
                }
            });

            proxy = swan.as(obj, 'MyArchetype');
            proxy.func();

            obj.modified.should.equal(true);
        });

        it('should modify original property when using property on proxy', function() {
            var proxy,
                obj = {
                    modified: false
                };

            swan.define('MyArchetype', {
                signature: {
                    modified: 'boolean'
                }
            });

            proxy = swan.as(obj, 'MyArchetype');
            proxy.modified(true);

            obj.modified.should.equal(true);
        });

        it('should return a function property when ecma5 is disabled', function() {
            var proxy,
                obj = {
                    modified: false
                };

            swan.ecma5(false);
            
            swan.define('MyArchetype', {
                signature: {
                    modified: 'boolean'
                }
            });

            proxy = swan.as(obj, 'MyArchetype');

            proxy.modified.should.be.a('function');
        });

        it('should return a setter/getter property when ecma5 is enabled', function() {
            var proxy,
                descriptor,
                obj = {
                    modified: false
                };

            swan.ecma5();
            
            swan.define('MyArchetype', {
                signature: {
                    modified: 'boolean'
                }
            });

            proxy = swan.as(obj, 'MyArchetype');
            descriptor = Object.getOwnPropertyDescriptor(proxy, 'modified');

            descriptor.should.have.property('get');
            descriptor.get.should.be.a('function');
            descriptor.should.have.property('set');
            descriptor.set.should.be.a('function');
        });

        it('should modify original object when assigning property with ecma5 enabled', function() {
            var proxy,
                obj = {
                    modified: false
                };

            swan.ecma5();

            swan.define('MyArchetype', {
                signature: {
                    modified: 'boolean'
                }
            });

            proxy = swan.as(obj, 'MyArchetype');
            proxy.modified = true;

            obj.modified.should.equal(true);
        });
    });
});