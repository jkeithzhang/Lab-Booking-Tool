module.exports = function(app) {
	/*
	* PARTIALS
	*/
	app.get('/partials/:name', function (req, res) { 
		var name = req.params.name;
			res.render('partials/' + name);
	});
}
	