var fs = require('fs')
,	q = require('q')
;

function getFilename(parts) {
	var filename = './' + parts.join('/') + '/generator.js';
	return filename;
}

function MysticModule(parts) {
	this.generator = require(getFilename(parts));
	this.parts = parts;
}

function getModule(parts, callback) {
	var filename = getFilename(parts);
	return q.nfcall(fs.access, filename, fs.R_OK).then(function() {
		return new MysticModule(parts);
	}, function() {
		throw new Error(filename + " does not exist");
	});
}

module.exports = getModule;