var check = require('check-types')
;

function _and() {
	var args = Array.prototype.slice.call(arguments);
	return function(value) {
		for(var i = 0; i < args.length; i++) {
			if(!args[i](value)) {
				return false;
			}
			return true;
		}
	};
}

function Entry(family, inputs, outputs) {
	check.assert.array.of.string(family);
	this.family = family;
	
	check.apply(inputs,
		function(entry) {
			return check.all(check.map(entry, {
				'id': _and(check.assert.integer, check.assert.positive),
				'amount': _and(check.assert.integer, check.assert.positive)
			}));
		}
	);
	this.inputs = inputs;

	check.apply(outputs,
		function(entry) {
			return check.all(check.map(entry, {
				'id': _and(check.assert.integer, check.assert.positive),
				'minAmount': _and(check.assert.integer, check.assert.positive),
				'maxAmount': _and(check.assert.integer, check.assert.positive, function(maxAmount) { return check.assert.greater(maxAmount, entry.minAmount); }),
				'probability': function(probability) { return check.assert.inRange(probability, 0, 1); }
			}));
		}
	);
	var probabilitySum = 0;
	for(var i = 0; i < outputs.length; i++) {
		var output = outputs[i];
		probabilitySum += output.probability;
	}
	if(probabilitySum != 1) {
		throw new Error("the sum of all probabilities must be 1, not", probabilitySum);
	}
	this.outputs = outputs;
}

module.exports = Entry;