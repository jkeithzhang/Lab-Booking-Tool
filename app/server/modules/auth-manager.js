var	userDB 		= require('./model').users(),
	i 			= require('./assets'),
	async 		= require('async'),
	fs 			= require('fs'),
	_ 			= require('underscore');

module.exports = function() {

	this.login = function(csl, res) {
		userDB.update(
			{csl: csl},
			{
				$set: {
					authenticated: 1
				}
			}, function(err, result) {
				if(err) {
					console.log(err);
				} else {
					userDB.find({
						$and: [
							{ csl : csl },
						]
					}, function(err, cursor) {
						if (err) { console.log('ERRROROROROROROR') }
						else {
							cursor.toArray(function(err, rec) {
								if(err) {
									console.log('something is fishy')
								} else {
									res.cookie('mycookie', rec, { expires: new Date(Date.now() + 604800000), httpOnly: true }).send();
									res.json(rec);
								}
							})
						}
					});						
				}
			}
		);

	}

	this.signup = function(user, res) {

		var user = JSON.parse(user);
		var tec = 0, admin = 0;
		db2.query('SELECT * FROM tecs WHERE csl="'+user.csl+'"', function(err, rows) {
			if (rows.length) {
				tec = 1;
			}
			userDB.findOne({csl: user.csl}, function(err, result) {
				if (result) {
					res.json({'type': 'warning', 'msg': 'Account with '+user.csl+' exists!'});
				} else {
					userDB.insert({
						csl: user.csl,
						first_name: user.firstname,
						last_name: user.lastname,
						country: user.country,
						phone: user.phone,
						location: user.location,
						email: user.email,
						authenticated: 1,
						permissions : {
			            	tec : tec,
			            	admin : admin 
			    		}
					}, function(err, result) {
						if (err) {
							console.log('ERROR');
						} else {
							res.json({'type':'success', 'msg':'Account creation succeed!'});				
						}
					});
				}
			})
		});

		
	}

	this.logout = function(csl, res) {
		console.log('done log out');
		userDB.update(
			{csl: csl},
			{
				$set: {
					authenticated: 0
				}
			}, function(err, result) {
				if(err) {
					console.log(err);
				} else {
					res.clearCookie('mycookie', { path: '/' });
					res.json('done');					
				}
			}
		);
	}

	this.ifexpire = function(cookieobject, res) {

		if(!cookieobject.hasOwnProperty('mycookie')) { //expired already, authenticated needed EAQUL to 0 ADD ANOTHER FIELD
			console.log('expired');
			userDB.update(
				{csl: csl},
				{
					$set: {
						authenticated: 0
					}
				}, function(err, result) {
					if(err) {
						console.log(err);
					} else {
						res.json('done');
					}
				}
			);
			res.send('expired');			
		} else {	//return user info
			console.log("in AM: ", cookieobject.mycookie[0]);
			cookieinfo = cookieobject.mycookie[0];  //object here
			var csl = cookieinfo.csl;
			userDB.find({
				$and: [
					{ csl : csl },
				]
			}, function(err, cursor) {
				if (err) { console.log('ERRROROROROROROR') }
				else {
					cursor.toArray(function(err, rec) {
						if(err) {
							console.log('something is fishy')
						} else {
							res.json(rec);
						}
					})
				}
			});		
		}
	}

}