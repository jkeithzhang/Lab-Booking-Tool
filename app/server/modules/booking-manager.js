var i  			= require('./assets');
var bookings 	= require('./model').bookings();

var list = [];

exports.addNode = function(newData, callback) {
	bookings.findOne({ip:newData.ip}, function(e, o) {
		if (o) {
			callback('ip-taken');
		} else {
			bookings.insert(newData, {safe: true}, callback);
		}
	});
}

exports.remove = function(ip) {

}

exports.getAllBookings = function(callback) {
	bookings.find().toArray(function(e, res) {
		if (e) callback(e);
		else callback(null, res);
	});
}

