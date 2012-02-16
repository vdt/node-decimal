This is a decimal library for node.js which supports arbitrarily large numbers using substack/node-bigint

## install

```shell
npm install git://github.com/bitfloor/node-decimal.git
```

## basic usage

```javascript
var decimal = require('decimal');

// the 'deciaml' module exposes methods like 'add', 'sub', 'mul'
// each of these methods returns a Decimal object and you can chain the methods
var num = decimal.add(1.2, 2.3).add(0.2).toNumber();

// The toNumber() and toString() methods will return the respective native types
// Note: If the number outside the precision of the native Number type
// you should be using toString to store it and preserve the precision
var result = decimal.add(1.2, 2.3).toString(); // yeilds '2.5'

// All of the operator methods also support string input
// this is how you can preserve precision if exceeding the capabilities of the native types
var result = decimal.add('1.2', '2.3').toString(); // yeilds '2.5'
```