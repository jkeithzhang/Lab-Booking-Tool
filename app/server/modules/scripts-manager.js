var	scriptDB 	= require('./model').scripts();

module.exports = function() {

	this.getAllScripts = function(res) {
		scriptDB.find({}, function(err, cursor) {
			cursor.toArray(function(err, rec) {
				console.log(rec)
				res.json(rec);
			})
		});
	}
}