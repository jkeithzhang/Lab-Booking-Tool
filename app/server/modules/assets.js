exports._info = function(str) {
	console.log('INFO :: ' + str);
}

exports._debug = function(str) {
	console.log('DEBUG :: ' + str);
}

exports._wrap = function(str) {
	console.log('... >>> ...');
	console.log(str);
	console.log('... <<< ...');
}

exports._err = function(str) {
	console.log('ERROR :: ' + str);
}