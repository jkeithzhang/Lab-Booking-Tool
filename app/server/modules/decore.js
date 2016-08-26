// var db 		= require('./mysql').connection,
// 	db2 	= require('./mysql2').connection;
// var nodeDB 	= require('./model').nodes(),
// 	sigDB 	= require('./model').sigs(),
// 	sigTestDB = require('./model').sigTests();

// var i 		= require('./assets');
// var ping 	= require('ping');
// var async 	= require('async');
// var fs 		= require('fs');
// var _ = require('underscore');
// var StringDecoder = require('string_decoder').StringDecoder;

module.exports = function() {
	// this.decore = function(file, res) {
		
	// }

	// this.decore_c = function(file, res) {
	// 	fs.readFile(__dirname + "/../../public/uploads/seany/sample.ts", function (err, data) {
	// 		// 
	// 		// determine if it is valid core file
	// 		var coreType = parseInt(data[0]<<24) + parseInt(data[1]<<16) + parseInt(data[2]<<8) + parseInt(data[3]);
	// 		if (!coreType || coreType > 4) {
	// 			console.log('Unknown core file type: ' + coreType);
	// 		} else {
	// 			console.log('Core type good, move on...[coreType: ' + coreType + ']')
	// 		}

	// 		var dateStringArray = [],
	// 			buildStringArray = [],
	// 			random = [],
	// 			passwdStringArray = [],
	// 			done = false,
	// 			dateString = '';
	// 		// 
	// 		// date string
	// 		for(var i=0; i<100; i++) {
	// 			if (!done) dateStringArray[i] = data[4+i];
	// 			if (dateStringArray[i] == 0) done = true;
	// 		}
	// 		var StringDecoder = require('string_decoder').StringDecoder;
	// 		var decoder = new StringDecoder('utf8');

	// 		var date = new Buffer(dateStringArray);
	// 		console.log(decoder.write(date));
	// 		// 
	// 		// build string
	// 		for(var i=0; i<200; i++) {
	// 			buildStringArray[i] = data[104+i];
	// 		}
	// 		var build = new Buffer(buildStringArray);
	// 		console.log(decoder.write(build));
	// 		// 
	// 		// random seed
	// 		var randomSeed 	= parseInt(data[304] << 24)
	// 						+ parseInt(data[305] << 16)
	// 						+ parseInt(data[306] << 8)
	// 						+ parseInt(data[307]);
	// 			randomSeed = randomSeed ^ 0xDEADBEEF;
	// 		// 
	// 		// get passwd
	// 		for(var i=0; i<16; i++) {
	// 			passwdStringArray[i] = data[308+i];
	// 		}
	// 		passwdStringArray[16] = '\0';
	// 		var passwd = new Buffer(passwdStringArray);
	// 		console.log(decoder.write(passwd));
	// 		// 
	// 		// get pad
	// 		// just skip to 512

	// 		// 
	// 		// compressed file size
	// 		var processCount = 512,
	// 			length = data.length - 512;

	// 		var actualLength = [];
	// 			actualLength[0] = data[processCount-4];
	// 			actualLength[1] = data[processCount-3];
	// 			actualLength[2] = data[processCount-2];
	// 			actualLength[3] = data[processCount-1];

	// 		var actualSize 	= parseInt(actualLength[0] << 24)
	// 						+ parseInt(actualLength[1] << 16)
	// 						+ parseInt(actualLength[2] << 8)
	// 						+ parseInt(actualLength[3])

	// 		while(processCount < length) {
	// 			data[processCount] = data[processCount] ^ ((randomSeed >> 16) & 0xFF);
	// 			data[processCount+1] = data[processCount+1] ^ ((randomSeed >> 8) & 0xFF);
	// 			data[processCount+2] = data[processCount+2] ^ ((randomSeed) & 0xFF);
	// 			data[processCount+3] = data[processCount+3] ^ ((randomSeed >> 24) & 0xFF);

	// 			processCount = processCount + 4;

	// 			randomSeed = (randomSeed * 1103515245 + 12345) & 0x7fffffff;

	// 		}
	// 		// console.log(decoder.write(data))

	// 		fs.writeFile(__dirname + "/../../public/uploads/seany/sample.txt.gz", data, function(err) {
	// 		    if(err) {
	// 		        console.log(err);
	// 		    } else {
	// 		        console.log("The file was saved!");
	// 		    }
	// 		}); 
	// 	});


	
	// }
}