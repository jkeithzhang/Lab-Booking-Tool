
module.exports = function(app, SRM, MAIL) {
	// 
	// Soccer Script
	// 
	app.get('/api/playerList', function (req, res) {
		var filter = req.param('filter');
		new SRM().playerList(filter, res);
	});

	app.post('/api/addPlayer', function (req, res) {
		var player = JSON.parse(req.param('player'));
		new SRM().addPlayer(player, res);
	});

	app.post('/api/payBalance', function (req, res) {
		var player = JSON.parse(req.param('player')),
			date = req.param('date');

		new SRM().payBalance(player, date, res);
	});

	app.get('/api/remind', function (req, res) {
		var players  = req.param('players'),
			monGames = req.param('monGames'),
			wedGames = req.param('wedGames');

		var season 	= '2014/2015 Fall/Winter',
			subject = 'OZDome - Indoor Pickup Soccer',
			sender 	= 'T3C Soccer Mom';

		for(var i=0; i<players.length; i++) {
			var player = JSON.parse(players[i]);
			var to = player.email;
			var msg = '';

			msg = 'Hi ' + player.firstName + ',<BR><BR>You are receiving this email because you have signed up for ' + subject + ' ['+season+'], I need your payment of '+player.balance+' CAD before Sep 3th, 2014. <BR><BR>Note, we have limited spots available this year, plus OZDome requires payment in full before the start of the season this year, therefore, if your payment is not received on the date specified above, your spot will be given to people on the waiting list! <BR><BR> Your games will be on the following dates: <br>';
			console.log(player.monday)
			if (player.monday == 'true') {
				msg += '<br>Mondays: <br>============= <br>';
				for(var m=0; m<monGames.length; m++) {
					msg += monGames[m] + '<br>';
				}
			}
			if (player.wednesday == 'true') {
				msg += '<br>Wednesdays: <br>============= <br>';
				for(var w=0; w<wedGames.length; w++) {
					msg += wedGames[w] + '<br>';
				}
			}
			new MAIL().sendMail(sender, player.email, season+ ' ' +subject, msg, function(output) {
				// res.json(toReturn);
			});
		}
	})
}