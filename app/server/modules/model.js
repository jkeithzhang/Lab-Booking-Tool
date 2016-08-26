var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var i 			= require('./assets');
var mongo_info  = require('../../../config').mongo;

var dbPort		= mongo_info.dbPort;
var dbHost 		= mongo_info.dbHost;
var dbName 		= mongo_info.dbName;
var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}, {w: 1}));
	db.open(function (e, d) {
		if (e) {
			i._err(e);
		} else {
			i._info('connected to database :: ' + dbName);
		}
	});

/*
 * COLLECTIONS
 */
var nodes 		= db.collection('nodes');
var bookings 	= db.collection('booking');
var types 		= db.collection('types');
var users       = db.collection('users');
var parts 		= db.collection('parts');
var ctl			= db.collection('ctl');
var ntl			= db.collection('ntl');

exports.users = function() {
	return users;
}

exports.nodes = function() {
	return nodes;
}

exports.bookings = function() {
	return bookings;
}

exports.types = function() {
	return types;
}

exports.parts = function() {
	return parts;
}

exports.ctl = function() {
	return ctl;
}

exports.ntl = function() {
	return ntl;
}

exports.db = function() {
	return db;
}

