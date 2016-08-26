module.exports = function(app) {
	app.get('/', function(req, res) {
		res.render('book', {title: 'Book'});
	});

 	app.get('*', function(req, res) { 
 		res.render('404', { title: 'Page Not Found'}); 
 	});
}
