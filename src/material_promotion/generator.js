var Entry = require('../entry');

function generate() {
	return [
		new Entry(
			["a",  "b"],
			[
				{
					id: 33,
					amount: 10
				}
			],
			[
				{
					id: 5,
					minAmount: 3,
					maxAmount: 7,
					probability: 1
				}
			])
	];
}

module.exports = generate;