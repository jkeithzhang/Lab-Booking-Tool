var	soccerDB 	= require('./model').soccers();

module.exports = function() {

	var priceTable = {
		monday: 170,
		wednesday: 170
	}

	this.playerList = function(filter, res) {
		soccerDB.find({}, function(err, cursor) {
			cursor.toArray(function(err, rec) {
				console.log(rec)
				res.json(rec);
			})
		});
	}

	this.addPlayer = function(player, res) {
		// console.log(typeof(player))
		if (player.monday == 'true') {
			player.balance += priceTable.monday;
		}
		if (player.wednesday == 'true') {
			player.balance += priceTable.wednesday;
		}
		soccerDB.insert(player, function(err, result) {
			res.json(result)
			console.log(result);
		})
	}

	this.payBalance = function(player, date, res) {
		soccerDB.update({
			$and: [
				{firstName: player.firstName},
				{lastName: player.lastName}
			]
		}, {
			$set: {
				paid: true,
				paid_date: date
			}
		}, function(err, result) {
			res.json('done')
		})
	}

	
}