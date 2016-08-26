var	nodeDB 	= require('./model').nodes(),
    typeDB  = require('./model').types(),
	i 		= require('./assets'),
	ping 	= require('ping'),
	async 	= require('async'),
	fs 		= require('fs');

module.exports = function(io) {

	this.loadTypes = function(res) {
		typeDB.find({}, function(err, cursor) {
			cursor.toArray(function(err, rec) {
				res.json(rec);
			})
		});
	}
	
}