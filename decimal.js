var bigint = require('bigint');

/// main method used to create a Decimal object from a number
function decimal(num) {
    // convert to a string
    num = '' + num;

    // find decimal point
    var dec = num.indexOf('.');

    if (dec >= 0) {
        // take out the decimal point
        num = num.replace('.', '');
        var precision = num.length - dec;
    } else {
        var precision = 0;
    }

    return new Decimal(bigint(num), precision);
}

function Decimal(num, precision) {
    this._num = num;
    this._precision = precision;
}

// TODO: this is probably slow, make faster
Decimal.prototype.toString = function() {
    var num_str = this._num.toString();

    // 0 precision, just return the int
    if (this._precision <= 0) {
        return num_str;
    }

    // if number is negative, store that and make it positive
    var neg = false;
    if (num_str.charAt(0) === '-') {
        // negative
        neg = true;
        num_str = num_str.slice(1);
    }

    // find index where to add the decimal point
    var idx = num_str.length - this._precision;

    // insert the proper number of 0s after the .
    if(idx < 0) {
        var zeros = new Array(-idx + 1).join('0');
        idx = 0;
    } else {
        var zeros = '';
    }

    // make sure there's always a number before the .
    var before_dot = idx > 0 ? num_str.slice(0, idx) : '0';

    return (neg ? '-' : '') + before_dot + '.' + zeros + num_str.slice(idx);
};

Decimal.prototype.toNumber = function() {
    return this.toString() - 0;
};

Decimal.prototype.copy = function() {
    return decimal(this);
};

/// return {int} the precision
Decimal.prototype.get_precision = function() {
    return this._precision;
};

/// setting precision to < current precision will floor, NOT round
/// modifies this object
Decimal.prototype.set_precision = function(precision) {
    var precision_diff = precision - this._precision;

    if (precision_diff > 0) {
        this._num = this._num.mul(bigint(10).pow(precision_diff));
    } else if(precision_diff < 0) {
        this._num = this._num.div(bigint(10).pow(-precision_diff));
    }

    this._precision += precision_diff;

    return this;
};

/// returns a copy
Decimal.prototype.round = function(precision) {
    var copy = this.copy();

    if (precision >= copy._precision) {
        return copy;
    }

    var num_str = copy._num.toString();

    // the index to check for rounding
    var idx = num_str.length - copy._precision + precision;

    // the number to check if >= 5
    var n = num_str[idx] - 0;

    var neg = num_str[0] === '-';

    copy.set_precision(precision);

    if ((neg && n < 5) || (!neg && n >= 5)) {
        copy._num = copy._num.add(1);
    }

    return copy;
};

/// returns new Decimal, -this
Decimal.prototype.neg = function() {
    return new Decimal(this._num.neg(), this._precision);
};

/// like to_int but returns a bigint with arbitrary precision
Decimal.prototype.to_bigint = function(precision) {
    var copy = this.copy();
    copy.set_precision(precision);
    return copy._num;
};

/// converts a Decimal to an integer representation with specified precision
/// Decimal('32.1').to_int(5) will be converted to 3210000
/// for doing fast calculations before converting back with decimal.from_int
/// warning! cannot convert more than ~16 total decimal digits of precision
Decimal.prototype.to_int = function(precision) {
    var dec_str = this.round(precision).toString();
    return Math.round(dec_str * Math.pow(10, precision));
};

/// creates a Decimal from integer representation
/// decimal.from_int(3210000, 5) will create Decimal('32.10000')
decimal.from_int = function(intnum, precision) {
    return new Decimal(bigint(intnum), precision);
};

/// returns a + b
/// a, b can each be either a Decimal, String, or Number
/// will return a new Decimal with the greatest precision of the operands
decimal.add = function(a, b) {
    // force a,b to be Decimal
    if(!(a instanceof Decimal))
        a = decimal(a);
    if(!(b instanceof Decimal))
        b = decimal(b);

    // make sure num and a have the same precision
    if(a._precision < b._precision) {
        a = a.copy(); // copy before modifying
        a.set_precision(b._precision);
    } else if(b._precision < a._precision) {
        b = b.copy(); // copy before modifying
        b.set_precision(a._precision);
    }

    // the integer result
    var num_res = a._num.add(b._num);

    return new Decimal(num_res, a._precision);
};

/// returns a - b
/// a, b can each be either a Decimal, String, or Number
/// will return a new Decimal with the greatest precision of the operands
decimal.sub = function(a, b) {
    b = decimal(b); // convert/copy before modifying
    b._num = b._num.neg(); // negate
    return decimal.add(a, b);
};

/// returns a * b
/// a, b can each be either a Decimal, String, or Number
/// will return a new Decimal with precision = sum(a.precision,b.precision)
decimal.mul = function(a, b) {
    // force a,b to be Decimal
    if(!(a instanceof Decimal))
        a = decimal(a);
    if(!(b instanceof Decimal))
        b = decimal(b);

    return new Decimal(a._num.mul(b._num), a._precision + b._precision);
};

/// returns < 0 if a < b, 0 if a == b, > 0 if a > b
decimal.cmp = function(a, b) {
    // force a,b to be Decimal
    if(!(a instanceof Decimal))
        a = decimal(a);
    if(!(b instanceof Decimal))
        b = decimal(b);

    return a.sub(b).toNumber();
};

decimal.eq = function(a, b) {
    return decimal.cmp(a, b) === 0;
};

decimal.gt = function(a, b) {
    return decimal.cmp(a, b) > 0;
};

decimal.gte = function(a, b) {
    return decimal.cmp(a, b) >= 0;
};

decimal.lt = function(a, b) {
    return decimal.cmp(a, b) < 0;
};

decimal.lte = function(a, b) {
    return decimal.cmp(a, b) <= 0;
};

// add all the static methods in decimal to Decimal's prototype
(function() {
    function add_method(name) {
        Decimal.prototype[name] = function(b) {
            return decimal[name](this, b);
        }
    }

    for(var i in decimal) {
        add_method(i);
    }
})();

module.exports = decimal;
