var decimal = require('./');

module.exports.decimal = {

    // parse/serialize, representation
    parse_serialize: function(assert) {
        // zeros
        assert.equal(decimal(0).toString(), '0');
        assert.equal(decimal('0').toString(), '0');
        assert.equal(decimal('0.').toString(), '0');
        assert.equal(decimal('.0').toString(), '0.0');
        assert.equal(decimal('-.00').toString(), '0.00');
        assert.equal(decimal('0.000').toString(), '0.000');

        // whole number
        assert.equal(decimal(5).toString(), '5');
        assert.equal(decimal(-5).toString(), '-5');
        assert.equal(decimal('5').toString(), '5');
        assert.equal(decimal('-5').toString(), '-5');

        // misc
        assert.equal(decimal(1.2).toString(), '1.2');
        assert.equal(decimal(.2).toString(), '0.2');
        assert.equal(decimal(-.2).toString(), '-0.2');
        assert.equal(decimal(-1.2).toString(), '-1.2');
        assert.equal(decimal('0.001').toString(), '0.001');
        assert.equal(decimal('0.001234').toString(), '0.001234');
        assert.equal(decimal(123).toString(), '123');
        assert.equal(decimal(-234).toString(), '-234');

        // large numbers
        assert.equal(decimal('987654321987654321').toString(), '987654321987654321');
        assert.equal(decimal('-987654321987654321.12345678901').toString(), '-987654321987654321.12345678901');
        assert.equal(decimal('987654321987654321.12345678901').toString(), '987654321987654321.12345678901');
        assert.equal(decimal('-.000098765432198765432112345678901').toString(), '-0.000098765432198765432112345678901');

        assert.done();
    },

    add: function(assert) {
        assert.equal(decimal.add(0, 0).toString(), '0');
        assert.equal(decimal.add(-0, 0.0).toString(), '0');

        // presers precision
        assert.equal(decimal.add(1.2, -1.2).toString(), '0.0');

        // misc
        assert.equal(decimal.add(1.2, 2.4).toString(), '3.6');

        // large numbers
        assert.equal(decimal.add('987654321987654321.12345678901', 1000.012).toString(), '987654321987655321.13545678901');

        assert.equal(decimal.add('987654321987654321.12345678901', '-987654321987654321.12345678901').toString(), '0.00000000000');

        assert.done();
    },

    sub: function(assert) {
        assert.equal(decimal.sub(0, 0).toString(), '0');
        assert.equal(decimal.sub('0', '-0').toString(), '0');

        assert.equal(decimal.sub('1.0', '-1.0').toString(), '2.0');

        assert.equal(decimal('987654321987654321.12345678901').sub(100.012).toString(), '987654321987654221.11145678901');
        assert.equal(decimal(100.012).sub(decimal('987654321987654321.12345678901')).toString(), '-987654321987654221.11145678901');

        assert.done();
    },

    mul: function(assert) {
        assert.equal('' + decimal.mul(1.2, 2.4), '2.88');
        assert.equal('' + decimal.mul(.2, 2.4), '0.48');
        assert.equal('' + decimal.mul(.2, 2), '0.4');
        assert.equal('' + decimal.mul(5, 2), '10');
        assert.equal('' + decimal.mul('123456789.32423455645', '123323.34343'), '15225104028597.7358269570716235');

        assert.done();
    },

    precision: function(assert) {
        assert.equal('' + decimal(1.999).set_precision(30), '1.999000000000000000000000000000');
        assert.equal('' + decimal(1.999).set_precision(1), '1.9');
        assert.equal('' + decimal(-1.999).set_precision(30), '-1.999000000000000000000000000000');
        assert.equal('' + decimal(-1.999).set_precision(1), '-2.0'); // TODO: is this correct behavior?

        assert.done();
    },

    round: function(assert) {
        assert.equal('' + decimal(123.999).round(30), '123.999');
        assert.equal('' + decimal(123.999).round(1), '124.0');
        assert.equal('' + decimal(123.450).round(1), '123.5');
        assert.equal('' + decimal(123.449).round(1), '123.4');
        assert.equal('' + decimal(123.495).round(2), '123.50');
        assert.equal('' + decimal(123.495).round(0), '123');
        assert.equal('' + decimal(123.500).round(0), '124');

        assert.equal('' + decimal(-123.999).round(30), '-123.999');
        assert.equal('' + decimal(-123.999).round(1), '-124.0');
        assert.equal('' + decimal(-123.450).round(1), '-123.5');
        assert.equal('' + decimal(-123.449).round(1), '-123.4');
        assert.equal('' + decimal(-123.495).round(2), '-123.50');
        assert.equal('' + decimal(-123.495).round(0), '-123');
        assert.equal('' + decimal(-123.500).round(0), '-124');

        assert.equal('' + decimal(0.999).round(30), '0.999');
        assert.equal('' + decimal(0.999).round(1), '1.0');
        assert.equal('' + decimal(0.450).round(1), '0.5');
        assert.equal('' + decimal(0.449).round(1), '0.4');
        assert.equal('' + decimal(0.495).round(2), '0.50');
        assert.equal('' + decimal(0.495).round(0), '0');

        assert.equal('' + decimal(-0.999).round(30), '-0.999');
        assert.equal('' + decimal(-0.999).round(1), '-1.0');
        assert.equal('' + decimal(-0.450).round(1), '-0.5');
        assert.equal('' + decimal(-0.449).round(1), '-0.4');
        assert.equal('' + decimal(-0.495).round(2), '-0.50');
        assert.equal('' + decimal(-0.495).round(0), '0');

        assert.equal('' + decimal('0.000').round(0), '0');
        assert.equal('' + decimal('0.000').round(1), '0.0');

        assert.done();
    },

    int_conv: function(assert) {
        assert.equal('' + decimal.from_int(0, 0), '0');
        assert.equal('' + decimal.from_int(1, 0), '1');
        assert.equal('' + decimal.from_int(-1, 0), '-1');
        assert.equal('' + decimal.from_int(0, 5), '0.00000');
        assert.equal('' + decimal.from_int(1, 5), '0.00001');
        assert.equal('' + decimal.from_int(-1, 5), '-0.00001');
        assert.equal('' + decimal.from_int(123456, 5), '1.23456');
        assert.equal('' + decimal.from_int(-123456, 5), '-1.23456');

        assert.equal(decimal('0').to_int(1), 0);
        assert.equal(decimal('1').to_int(0), 1);
        assert.equal(decimal('1').to_int(2), 100);
        assert.equal(decimal('1.2345').to_int(5), 123450);
        assert.equal(decimal('-1.2345').to_int(5), -123450);

        assert.done();
    },

    get_precision: function(assert) {
        assert.equal(0, decimal('0').get_precision());
        assert.equal(2, decimal('0.20').get_precision());
        assert.equal(1, decimal('.5').get_precision());

        assert.done();
    },

    to_bigint: function(assert) {
        var d1 = decimal('12.35');
        assert.equal('1235', '' + d1.to_bigint(2));
        assert.equal('1235000', '' + d1.to_bigint(5));
        assert.equal('123', '' + d1.to_bigint(1));

        assert.done();
    },
}
