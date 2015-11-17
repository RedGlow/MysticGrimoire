/* global __dirname */
var fs = require('fs')
,	path = require('path')
,	q = require('q')
,	getModule = require('./mystic-module')
;

/**
 * Traverse the modules of mystic grimoire, and return them.
 * 
 * @return		q.promise<MysticModule[]>		A promise containing all the found modules
 */
function traverseModules() {
	return _traverseModules([], []);
}

function _traverseModules(parts, accumulator) {
	// produce the directory name to navigate
	var dirname = path.join.apply(path.join, parts);
	// get the module corresponding to the current directory
	return getModule(parts).then(function(mysticModule) {
		// save it
		accumulator.push(mysticModule);
		// navigate the subdirectories
		return q.nfcall(fs.readdir, dirname);
	}).then(function(subdirnames) {
		// compose the subdirectories promises
		return q.all(subdirnames.map(function(subdirname) {
			// check if the found dir is a directory
			return q.nfcall(fs.stat, path.join(dirname, subdirname))
				.then(function(stats) {
					if(stats.isDirectory()) {
						// is a directory: recurse
						return _traverseModules(parts.concat([subdirname]), accumulator);
					} else {
						// not a directory: do nothing
						return q.when();
					}
				});
		}));
	}).then(function() {
		// return the result
		return accumulator;
	});
}

console.log("start.");
traverseModules(__dirname).then(function(mysticModules) {
	try {
		mysticModules.forEach(function(mysticModule) {
			console.log("Found module:", mysticModule.parts);
		});
		var generatedElements = [];
		mysticModules.forEach(function(mysticModule) {
			mysticModule.generator().forEach(function(entry) {
				generatedElements.push(entry);
			});
		});
		console.log("Generated elements:", generatedElements);
	} catch(e) {
		console.log(e);
		throw e;
	}
}, function(err) { 
	console.log("got error:", err);
});