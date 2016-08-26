
module.exports = function(app, SPM, EXP, MAIL) {
	// 
	// 
	// 
	// 
	// Node Script
	// 
	app.get('/api/getAllScripts', function (req, res) {
		console.log('HERE NOW')
		new SPM().getAllScripts(res);
	})

	app.get('/api/stop', function (req, res) {
		console.log('called stop...')
		new EXP().stop();
	})

	app.get('/api/fanCheck', function (req, res) {
		var host = req.param('host'),
			username = req.param('username'),
			password = req.param('password'),
			command = req.param('command'),
			regex = req.param('regex'),
			interval = req.param('interval');
			user = JSON.parse(req.param('user'));

		var foo = function(exp, command, regex, res) {
			console.log('test')
		}
		var count = 0;

		var fanCheck = function(exp, command, regex, res) {
			var string = '';
			var toReturn = {};
			count ++;

			exp.expect(/\*?[A|B]:.*# /, function(err, output, match) {
				/* make sure we do not get hold up by long output */
				string += output;
			    exp.send('env no more' + '\n');
			    exp.expect(/\*?[A|B]:.*# /, function(err, output, match) {
			    	string += output;
		    		exp.send(command + '\n');
			    	exp.expect(/\*?[A|B]:.*# /, function(err, output, match) {
			    		string += output;
		    			var regexObj = new RegExp(regex),
			    			match = regexObj.exec(output);
			    		toReturn.count = count;

			    		if (match) {
			    			toReturn.found = true;
			    			toReturn.match = match;
			    			toReturn.output = string;
			    			new MAIL().sendMail(user.email, 'found the match', 'HI', function(output) {
			    				res.json(toReturn);
			    			});
			    		} 
			    	});
		    	});
		  	});
		}

		new EXP().connect(host, username, password, command, regex, interval, fanCheck, res);
	})
}