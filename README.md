swan.js
=======

What is it?
-----------
Swan.js is a personal little experiment to bring an interface-like mechanism to JavaScript, which conforms and builds
upon the ideas of duck-typing. In short, it could be perceived as a library to help validating complex objects to a set
of rules.

Why is it called swan.js?
-------------------------
The naming is as far-fetched as taking the sometimes bad reputation given duck-typing, turning it into the story of the
ugly duckling and jumping to the end where he/she turns out to be a swan.

What are archetypes?
--------------------
Archetypes are what you would normally call an interface, but since the word interface has such tight associations
associated with it I decided to use a different name. An archetype differs from an interface in that an object itself is
not an explicit implementation of an interface, but rather an implicit match based on what functions, properties and
variables are assigned to it. As such, an interface would be a static property of an object, while an archetype is
something that could change over time when the object is rewritten.

How to use
----------
### Prerequisites
None... or well... you need a javascript environment of course. Any browser will do.

### Installation
Simply download the script and reference it from your code.

### Configuration
Swan.js requires little to no configuration. However, due to browser compatibility and general best practices in
javascript, some behaviors need to be toggle manually.

#### Object.prototype extensions
Some people might find the normal swan-syntax a little too verbose, and prefer it if you could call the `.is()`, `.as()`
and `.expect()` functions directly on any object. Since extensions on the `Object.prototype` are not uniformly supported
in browsers, and also generally discouraged, this behavior is turned of by default. To enable it, issues the following
command:

    swan.globalize(); // or
    swan.globalize(true);

The `.globalize()` function takes a boolean as its first argument, so to turn the functionality off again:

    swan.globalize(false);

By default, this feature is turned off. When creating the methods, `Object.defineProperty()` will be used in order to
mark the functions as non-enumerable. This feature is therefore only supported in environments where
`Object.defineProperty()` is available.

#### ECMAScript 5 Compliance
Someday we might see a time where all widely browsers support the beauty that is ECMAScript 5 and the
`Object.defineProperty()` and `Object.getOwnPropertyDescriptor()` functions. If you are using this library in another
environment (e.g. node.js) which supports ECMAScript 5, or just don't generally care about supporting certain browsers
(*cough* IE8 *couch*), you can enable ECMAScript 5 compliance so:

    swan.ecma5(); // or
    swan.ecma5(true);

Conversely, disabling it can be be done by passing false as the first argument:

    swan.ecma5(false);

By default, this feature is turned off.

### Fluent syntax
All functions can be used in two ways (disregarding the possibility of invoking the function directly from the
`Object.prototype` if configured). One way is to invoke them directly on the global swan-object like so:

    swan.is(object_to_match, 'archetype goes here');

However, the above syntax does not feel that fluent (and I am a sucker for fluent syntax) an alternative way of invoking
it is:

    swan(object_to_match).is('archetype goes here');

Both examples above achieve the same thing (in fact, the fluent version just translates the call to the global version),
but the second is a little bit more readable in my eyes. If you configure swan to extend `Object.prototype` the syntax
becomes even more fluent:

    object_to_match.is('archetype goes here');

However, using this syntax one has to be aware of the environment supporting the `Object.defineProperty()` function.
Also, a problem arises if the value of object_to_match is null or undefined.

### Defining archetypes
Defining archetypes is pretty central to the operation of swan.js. Thankfully, it is quite straightforward. Defining an
archetype can be as easy as this:

    swan.define('MyArchetype', {
        myBooleanProperty: "boolean",
        myFunction: "function"
    });

The above defines an archetype called 'MyArchetype', and any object that has a property called myBooleanProperty with a
boolean value and a function called myFunction will be considered to be of this archetype.

#### Predefined archetypes
There is a set of predefined archetypes, which largely correspond to the primitive types in JavaScript, as supported by
the typeof() operator. Below is a full list, which should require no additional explanation:

* any
* object
* string
* number
* boolean
* undefined
* array
* function

#### Special archetypes
Some of the out-of-the-box archetypes don't correspond to a specific type in JavaScript, but is rather a concept.

##### any
The any archetype matches anything, it is a wildcard. By using the any archetype, you are basically saying that as long
as the property is defined, I don't care what type it is.

##### array
It is of course useful to be able to accept arrays in archetypes, and the array-archetype lets you do this.

#### Definition syntax
Though there are several syntax-shortcuts to aid speedy development and reduce verbosity of the code, the main syntax is
something like this:

    swan.define('archetype' // string, {
        mixins: [] // array of archetypes
        signature: { // key-value pairs of properties and there associated archetype
            prop1: 'archetype1',
            /* ... */
            propN: 'archetypeN'
        }, // or alternatively:
        evaluator: function(val) { // an evaluator function returning a boolean whether archetype is a match or not.
            return !swan.is(val.prop, 'undefined');
        }
    });

#### Signatures
Using a signature is the general way of implementing a archetype. The signature object is a simple key-value object,
with the property and a string indicating its archetype.

    swan.define('customer', {
        signature: {
            name: 'string'
        }
    });

The above example would define an archetype called 'customer', which has a property of archetype string called 'name'.
For simple archetypes like the above, using the full syntax might be a little to verbose. So guess what? You can
register a signature based archetype by just passing the signature as the second argument, like so:

    swan.define('customer', {
        name: 'string'
    });

This will define the archetype in the exact same way as before, but with less code.

#### Mixins
An archetype can have mixins, i.e. it can be a mixture of other archetypes. To define such an archetype, you need to
simply include a property called mixins in the archetype definition. Drawing on the previous example, we could create a
VIP customer like so:

    swan.define('vipCustomer', {
        mixins: 'customer',
        signature: {
            phone: 'string'
        }
    });

The above example means that the vipCustomer archetype will contain not only the properties in the signature, but also
the properties of all archetypes defined in the mixins-property. To define an archetype as a composition of several
mixins, just provide an array of all the archetypes to mixin:

    swan.define('archetype', {
        mixins: ['archetype1', /* ... */ 'archetypeN'],
        signature: {
            prop1: 'string'
        }
    });

An archetype can be a pure mixin archetype, i.e. it consists only of other archetypes. To define such an archetype,
simply omit the signature-property, or pass an array as the second argument in the define-function:

    swan.define('archetype', {
        mixins: ['archetype1', /* ... */ 'archetypeN']
    });

    swan.define('archetype', ['archetype1', /* ... */ 'archetypeN']); // Nifty short-hand for above syntax.

#### Evaluator archetypes
Sometimes you might want to provide entirely your own logic to determine if an object matches an archetypes. This is
supported via the evaluator-property in the archetype definition. The evaluator-property should be a function which
accepts one argument, the object to evaluator, and return a boolean value whether or not the object matches the
archetype:

    swan.define('archetype', {
        evaluator: function(val) {
            return typeof(val.name) === 'string';
        }
    });

By defining an evaluator function, you effectively override any signature or mixin matching. These properties will
therefore be ignored in the archetype definition object. Passing the function as the second argument in the `.define()`
method is a short-hand for creating a evaluator archetype:

    swan.define('archetype', function(val) {
        return typeof(val.name) === 'string';
    });

### Validating archetypes
There is no use in defining archetypes if you can't match objects to them. This is where the `.is()` and `.expect()`
functions come in.

#### The `.is()` function
The `.is()` function evaluates and object and its properties to determine if it matches all of the given archetypes. Its
signature is:

    swan.is(
        val, // object to evaluate
        'archetype1', // list of archetypes to match
        /* ... */
        'archetypeN'
    ); // returns boolean

    swan(val).is('archetype1', /* ... */ 'archetypeN') // Fluent alternative

Imagine the following scenario, built on previous examples with the customer and the vipCustomer, there might be an
occurrence where we need to determine whether the customer is vip or not. One way to do this would be to use the `.is()`
function:

    if(swan(customer).is('vipCustomer')) {
        // Bring out the champagne or whatever...
    } else {
        // Do normal customer stuff...
    }

#### The `.expect()` function
Similar to the `.is()` function, the `.expect()` function determines whether an object matches an archetype. The
`.expect()` function, however, throw an error if the object is not of the expected type. Its signature is:

    swan.expect(
        val, // object to evaluate
        'archetype', // expected archetype
        errorMsg, // Optional: an error message to be passed to the error object being thrown.
    );

    swan(val).expect('archetype', errorMsg); // Fluent alternative

This makes it ideal for validating the type of objects passed in as parameters to a function. Building upon the customer
example used previously:

    function notifyCustomer(customer, message) {
        swan(customer).expect('customer', "Invalid value for parameter 'customer'. Not a customer");
        swan(customer).expect('string', "Parameter message must be a string");

        // Continue to notify the customer
    }

### Casting
Swan.js can also help with hiding members except those defined by an archetype. This is done via the `.as()` function.
Its signature is:

    swan.as(
        val, // object to case
        'archetype' // archetype to cast to
    ); // returns an object with the archetype members, or null if the object does not match archetype

    swan(val).as('archetype'); // Fluent alternative

This will return a new object, which exposes only the properties which are a part of the signature of the archetype. All
values, properties and functions on the original object are proxied by this new object and any changes to that proxy
will also affect the original.

    swan.define('customer', {
        name: 'string',
        addOrder: 'function'
    });

    var person = { name: 'John Doe', age: 57, addOrder: function(order) { /* order processing */} },
        customer = swan(person).as('customer');

    customer.name('Jane Doe');

    console.log(person.name); // Outputs 'Jane Doe'
    console.log(typeof(customer.addOrder)); // Outputs 'function'
    console.log(typeof(customer.age)); // Outputs 'undefined'

In the above example, the object in variable person is casted to a customer archetype. The name is then changed via the
customer archetype object, which will alter the value of the original person object. The example also shows that not all
properties are accessible via the archetype object, but only those included in the archetype signature.

By default, all fields and properties will be proxied by a function. This is because ECMAScript 5 style properties are
not supported in all browsers. The syntax of these functions are:
 
    var value = proxy.name(); // gets the value
    proxy.name(value); // sets the value
    
It is important to note that the setters are always type-checked, so the setters will never accept any other type of
value than its archetype.

In order to use ECMAScript 5 properties, you have to configure swan.js with the `swan.ecma5()` function. This makes all
fields and properties use the standard assignment operator instead:

    var value = proxy.name; // gets the value
    proxy.name = value; // sets the value

Contributions
-------------
Contributions are welcome. Bugs can be reported via the issue tracker. Fixes should be sent as pull requests. New code
must follow the general style of existing code and be properly unit tested.

Release History
---------------
2013-03-24 - v0.7 - First public release