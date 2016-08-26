var Connection 	= require('ssh2');
var expect 		= require('stream-expect');
var defaultPort = 22;
var c 			= new Connection();
var i 			= require('./assets');

var procID = '';

module.exports = function() {
	this.runningProc = function() {
		console.log(procID)
		return procID;
	}

	this.stop = function() {
		console.log(procID)
		clearInterval(procID);
	}

	this.connect = function(host, username, password, command, regex, interval, expFunc, res) {
		c.connect({
			host: host,
			port: defaultPort,
			username: username,
			password: password
		});

		c.on('connect', function() {
			i._info('conncted to ' + host);
		});
		c.on('error', function(err) {
		  	i._err('Connection :: error :: ' + err);
		});
		c.on('end', function() {
		  	i._info('Connection :: end');
		});
		c.on('close', function(had_error) {
		  	i._info('Connection :: close');
		});

		c.on('ready', function() {
	  		c.shell(function(err, stream) {
			    if (err) throw err
			    /* Use ssh Connection as read and write stream */
				var exp = expect.createExpect(stream);

			    stream.on('close', function() {
			      	// console.log('Stream :: close');
			      	c.end();
			    });
			    stream.on('exit', function(code, signal) {
			      	// console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
			      	c.end();
			    });
			    console.log(interval)
			    procID = setInterval(function() {
			    	expFunc(exp, command, regex, res);
			    }, interval)
			    
			});
		});
	}
}