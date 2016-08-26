// DEV
var mongo_dev = {
	dbPort: 	27017,
	dbHost: 	'localhost',
	dbName: 	'booking'
};
var php_path_dev = '/usr/bin/';

// PRODUCTION
var mongo_prod = {
	dbPort: 	27017,
	dbHost: 	'138.120.131.85',
	dbName: 	'booking'
};
var php_path_prod = '/usr/bin/';

// ENV should be 'dev' by default
exports.mongo = global.process.env.NODE_ENV === 'production' ? mongo_prod : mongo_dev;
exports.php = global.process.env.NODE_ENV === 'production' ? php_path_prod : php_path_dev;
