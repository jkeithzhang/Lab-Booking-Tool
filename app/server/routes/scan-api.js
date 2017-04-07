var tsObjs = {};

module.exports = function(app, io, NM, TM, LDAP, AM) {
	// 
	// LDAP
	// 
	app.get('/api/ldap', function (req, res) {
		
		var csl = req.param('csl'),
			cip = req.param('cip');
		console.log("scan-api got:", csl);
		console.log("scan-api got:", cip);
		new LDAP().authenticate(csl, cip, res);
	});
	app.get('/api/signupLdap', function (req, res) {
		var csl = req.param('csl'),
			email = req.param('email');
		new LDAP().verify(csl, email, res);
	});
	app.post('/api/login', function (req, res) {
		var csl = req.param('csl'),
			cip = req.param('cip');
		// console.log(csl+".."+cip);
		new AM().login(csl, cip, res);
	});		
	// 
	// 
	// BOOKING 
	// 
	app.get('/api/getAllNodeLogRegistry', function (req, res) {
		new NM(io).getAllNodeLogRegistry(res);
	})
	app.get('/api/getNodeLog', function (req, res ) {
		var ip = req.param('ip');
		new NM(io).getNodeLog(ip, res);
	});
	app.get('/api/skipPing', function (req, res) {
		new NM(io).skipPing(res);
	});
	app.get('/api/pingAllNodes', function (req, res) {
		new NM(io).pingAllNodes(res);
	});
	app.get('/api/pingNode', function (req, res) {
		var node = JSON.parse(req.param('node'));
		new NM(io).pingNode(node, res);
	});
	// app.get('/api/nodeList', function (req, res) {
	// 	new NM(io).scanAllNodes('174', res)
	// });
	app.get('/api/loadNodes', function (req, res) {//here
		console.log(req.param('me'))
		if(req.param('me') == 'empty') {
			me = 'empty';
		} else {
			me = JSON.parse(req.param('me'));
		}
		var filter = req.param('filter'),
			login = me.csl,
			sort = JSON.parse(req.param('sort'));
		console.log('----->'+login);
		new NM(io).loadNodes(me, login, filter, sort, res);
	});
	app.get('/api/loadTypes', function (req, res) {
		new TM().loadTypes(res);
	});
	app.post('/api/releaseNode', function (req, res) {
		var node = JSON.parse(req.param('node')),
			options = JSON.parse(req.param('options'));
		new NM(io).releaseNode(node, options, res);

	});
	app.post('/api/bookNode', function (req, res) {
		var node = JSON.parse(req.param('node')),
			owner = JSON.parse(req.param('owner')),
			options = JSON.parse(req.param('options'))

		new NM(io).bookNode(node, owner, options, res);
	});
	app.post('/api/updateNode', function (req, res) {
		var node = JSON.parse(req.param('node'));
		new NM(io).updateNode(node, res);
	});
	app.post('/api/addNode', function (req, res) {
		var node = JSON.parse(req.param('node'));
		new NM(io).addNode(node, res);
	});
	app.post('/api/removeNode', function (req, res) {
		var node = JSON.parse(req.param('node'));
		new NM(io).removeNode(node, res);
	});
	app.post('/api/searchEngine', function (req, res) {
		var searchInput = (req.param('input'));
		new NM(io).searchNode(res,searchInput);
	});
	app.post('/api/searchUpdate', function (req,res) {
		new NM(io).getDate(res);
	});
	app.get('/api/login', function (req, res) {
		var csl = req.param('csl');
		new AM().login(csl, res);
	});
	app.get('/api/signup', function (req, res) {
		var user = req.param('user');
		new AM().signup(user, res);
	});	
	app.get('/api/logout', function (req, res) {
		var csl = req.param('csl');
		new AM().logout(csl, res);
	});	
	app.get('/api/ifexpire', function (req, res) {
		new AM().ifexpire(req.cookies, res);
	});

	// 
	// 
	// REGEX
	// 
	app.get('/api/regexText', function (req, res) {
		var regex 	= req.param('regex'),
			context	= req.param('context'),
			release = req.param('release'),
			sid = parseInt(req.param('sid')),
			tid = parseInt(req.param('tid'));

		new RP().evalRegex(regex, context, release, sid, tid, res);
	});	
}