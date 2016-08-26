
/**
 * Module dependencies.
 */
var express 		= require('express'),
	// MemoryStore     = express.session.MemoryStore,
	MemoryStore 	= require('connect-mongo')(express),
	app 			= express(),
	upload 			= require('jquery-file-upload-middleware'),
	sessionStore 	= new MemoryStore({
		url: 'mongodb://localhost:27017/session'
		// interval: 1200000
	});

/* style */
var stylus 			= require('stylus'),
	nib 			= require('nib');
/* system */ 	
var http 			= require('http');
var path 			= require('path');

var i 				= require('./app/server/modules/assets');

function compile(str, path) {
  	return stylus(str)
	    .set('filename', path)
	    .use(nib())
}

// bind event
upload.on('begin', function (fileInfo) {
	console.log('file upload begin');
	console.log(fileInfo);
});
upload.on('end', function (fileInfo) {
    // insert file info
    console.log("files upload complete");
    console.log(fileInfo);
});

upload.on('delete', function (fileName) {
    // remove file info
    console.log("files remove complete");
    console.log(fileName);
});

upload.on('error', function (e) {
    console.log(e.message);
});

app.configure(function() {
	// all environments
	app.set('port', process.env.PORT || 2000);
	app.set('views', __dirname + '/app/server/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.cookieParser());
	app.use(express.session(
		{
			store: sessionStore, 
			secret: 'secret'
			// key: 'cookie'
	   	}
    ));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	// 
	app.use(stylus.middleware({
		src: 		__dirname + '/app/public',
		compile: 	compile
	}));
	app.use(express.static(path.join(__dirname, '/app/public')));
	// app.use(app.router);

});

app.configure('development', function() {
	app.use(express.errorHandler());
});

//Mongod lists:
var io = require('socket.io').listen(app.listen(app.get('port')));
var NM = require('./app/server/modules/node-manager');
var MAIL = require('./app/server/modules/sendmail');
var TM = require('./app/server/modules/type-manager');
var LDAP = require('./app/server/modules/ldap');
var AM = require('./app/server/modules/auth-manager');


// Following block used for testing..
// setTimeout(function() {
// 	var date = new Date();
// 	var year 	= date.getFullYear(),
// 		mth 	= date.getMonth() < 9 ? "0"+ (date.getMonth() + 1) : (date.getMonth() + 1),
// 		day 	= date.getDate()  < 9 ? "0"+ date.getDate() : date.getDate(),
// 		nxtDay  = (date.getDate() + 1)  < 9 ? "0"+ (date.getDate() + 1) : (date.getDate() + 1),
// 		nnxtDay = (date.getDate() + 2)  < 9 ? "0"+ (date.getDate() + 2) : (date.getDate() + 2),
// 		nnnxtDay = (date.getDate() + 3)  < 9 ? "0"+ (date.getDate() + 3) : (date.getDate() + 3);
// 	// console.log(day+'|'+nxtDay+'|'+nnxtDay);
// 	new NM(io).curlReminder(year+'-'+mth+'-'+day, '', 'EXPIRED', MAIL);	
// }, 500);


setInterval(function() {
	var date = new Date();
	var current_hour = date.getHours();

	var year 	= date.getFullYear(),
		mth 	= date.getMonth() < 9 ? "0"+ (date.getMonth() + 1) : (date.getMonth() + 1),
		day 	= date.getDate()  < 9 ? "0"+ date.getDate() : date.getDate(),
		nxtDay  = (date.getDate() + 1)  < 9 ? "0"+ (date.getDate() + 1) : (date.getDate() + 1),
		nnxtDay = (date.getDate() + 2)  < 9 ? "0"+ (date.getDate() + 2) : (date.getDate() + 2),
		nnnxtDay = (date.getDate() + 3)  < 9 ? "0"+ (date.getDate() + 3) : (date.getDate() + 3);

	if (current_hour == 17) {
		// 
		// scan nodes and release the expired ones 
		new NM(io).releaseNodes(year+'-'+mth+'-'+day);
	}
	if (current_hour == 17) {
		// new NM(io).curlReminder(year+'-'+mth+'-'+nxtDay, year+'-'+mth+'-'+nnxtDay, 'EXPIRING', MAIL);
		new NM(io).curlReminder(year+'-'+mth+'-'+day, '', 'NOTIFICATION', MAIL);
	}
}, 3600000);

// console.log('....'+new Date().getHours());
/**
* Routes
*/
require('./app/server/routes/partials')(app);

require('./app/server/routes/scan-api')(app, io, NM, TM, LDAP, AM);

require('./app/server/routes/routes')(app);


/*
* EXPECT IO 
*/

io.sockets.on('connection', function (socket) {
	console.log('io connection')
	var Connection 	= require('ssh2');
	var expect 		= require('stream-expect');
	var defaultPort = 22;
	var c 			= new Connection();
	var init_connect = false, 
		init_uid = '';

	var reformat_output = function(_in, token) {
		return _in.replace('\r\n'+token, '');
	};

	c.on('ready', function() {
	  	c.shell(function(err, stream) {
	  		console.log('STREAM: ', stream)
		    if (err) throw err
		    /* Use ssh Connection as read and write stream */
			var exp = expect.createExpect(stream);

			/* make sure we do not get hold up by long output */
			if (init_connect) {
				init_connect = false;
				var uid = init_uid;
				init_uid = '';

				exp.send('env no more' + '\n');
		    	exp.expect(/\*?[A|B]:.*# /, function(err, output, match) {
		    		if (err) io.sockets.emit('error', { message: 'SOMETHING IS WRONG WITH THE SESSION :: ' + err});
			        else io.sockets.emit(uid, { cmd: 'env no more', prompt: match[0], output: reformat_output(output, match[0]) });
		    	});
			}

	    	socket.on('sendchat', function(data) {
	    		if (data.cmd == 'logout') {
	    			console.log('logging out')
		    		socket.emit('endchat', { message: 'LOGGED OUT' });
					socket.disconnect();
					// return false;
		    	}
	    		exp.send(data.cmd + '\n');
	    		exp.expect(/\*?[A|B]:.*# /, function(err, output, match) {
		    		if (err) io.sockets.emit('error', { message: 'SOMETHING IS WRONG WITH THE SESSION :: ' + err});
			        else io.sockets.emit(data.uid, { cmd: data.cmd, prompt: match[0], output: reformat_output(output, match[0]) });
		    	});
	    	})
		})
	});

	socket.on('conn_node', function(data) {
		console.log('connecting node', data.node.ip)

		if (!c._host) {
			console.log('-!!ready!!-')
			c.connect({
				host: data.node.ip,
				port: data.node.port ? data.node.port : defaultPort,
				username: data.node.username,
				password: data.node.password
			});
			init_connect = true;
			init_uid = data.uid;
		}
		
	});
});

