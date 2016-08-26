var	sigTestDB 	= require('./model').sigTests(),
	sigDB 		= require('./model').sigs(),
	i 			= require('./assets'),
	async 		= require('async'),
	fs 			= require('fs'),
	_ 			= require('underscore'),
	db2		 	= require('./mysql').connection;

module.exports = function() {
	function parseBoolean(string) {
		switch (String(string).toLowerCase()) {
			case "true":
			case "1":
			case "yes":
			case "y":
				return true;
			case "false":
			case "0":
			case "no":
			case "n":
				return false;
			default:
				return undefined;
		}
	}
	this.removeTest = function(rel, tid, res) {
		var queryKey = 'releases.'+rel+'.tests';
		var query = {};
			query[queryKey] = {'$elemMatch': {'tid': parseInt(tid)} };
		var pullQuery = {};
			pullQuery['$pull'] = {};
			pullQuery['$pull'][queryKey] = {'tid': parseInt(tid)};

		sigTestDB.update( 
			query, 
			pullQuery,
			function(err, result) {
				if (err) console.log(err);
				else {
					res.json('done');
				}
			}
		);
	}
	this.updateSigTest = function(rec, me, res) {
		var id = rec.sid;
		sigTestDB.findOne({sid: id}, function(err, st) {
			if (st) {
				var theReleases = rec.releases ? rec.releases : {};
				sigTestDB.update(
					{sid: id},
					{
						$set: {
							releases: rec.releases,
							platform: rec.platform,
							category: rec.category
						}
					}, function(err, result) {
						if (err) {
							console.log(err)
						} else {
							res.json('done');
							writeToFile('sigTests', rec, rec.platform, rec.sid, me.login);
						}
					}
				);
			} 
		});

	}
	this.loadCategories = function(platform, res) {
		sigDB.distinct('category', {
			platform: platform? platform : '7x50'
		}, function(err, results) {
			if (err) { console.log('ERRROROROROROROR') }
			else {
				res.json(results)
			}
		});
	}
	this.loadAllSignatures = function(me, res) {
		setTimeout(function() {
			var groupQuery = "SELECT group_id FROM user_groups WHERE username = '" + me + "'";		
			db2.query(groupQuery, function(err, rows) {
			if(err) throw err;
				setTimeout(function() {
					groupid = rows[0].group_id;		
					sigDB.find( { level: { $gte: groupid } }, function(err, cursor) {
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
				}, 500);
			});
		}, 500);
	}
	this.loadSignatures = function(platform, category, me, tec, sort, res) {
		tec = parseBoolean(tec);
		console.log(me)
		
		sigDB.find({
			$and: [
				{ platform: platform? platform : '7x50' },
				{ category: category? category : 'CPM' },
				{ level: tec? { $gte: 1} : { $gte: 3}},
				{ $or: [
						{ userid: me }, 
						{ userid: { $exists: false } }
					]
				}
			]
		}, {sort: sort}, function(err, cursor) {
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
	this.loadSignatureTests = function(platform, category, tec, sort, res) {
		sigTestDB.find({
			$and: [
				{ platform: platform? platform : '7x50' },
				{ category: category? category : 'CPM' }
			]
		}, {sort: sort}, function(err, cursor) {
			cursor.toArray(function(err, rec) {
				if(err) {
					console.log('something is fishy')
				} else {
					res.json(rec);
				}
			})
		});
	}

	var writeToFile = function(table, data, platform, id, userid) {
		var sigID = platform + '_sig_' + id;

		var exist_q = 'SELECT COUNT(1) FROM '+table+' WHERE sigID="'+sigID+'"';
		var query = '';
		db2.query(exist_q, function(err, rows) {
			var exist = rows[0]['COUNT(1)'];

			if(exist > 0) {
				query = "UPDATE "+table+" SET sigData='"+JSON.stringify(data, null, 4)+"' WHERE sigID='"+sigID+"'";
			} else {
				query = "INSERT INTO "+table+" VALUES ('"+sigID+"', '"+JSON.stringify(data, null, 4)+"', '"+userid+"')";
			}
			db2.query(query, function(err, rows) {
				console.log(rows)
			})

		});
	}

	this.addSignature = function(req, res) {
		var sigIDs = {
			'CPM': 1,
			'IOM': 100,
			'MDA': 200,
			'PORT': 300,
			'LOG': 400,
			'SYS': 500
		}
		sigDB.find({
			$and: [
				{ platform: req.param('platform')? req.param('platform') : '7x50' },
				{ category: req.param('category')? req.param('category') : 'CPM' }
			]
		}, {sort: {sid: -1}}, function(err, cursor) {
			if (err) { console.log('ERRROROROROROROR') }
			else {
				cursor.toArray(function(err, rec) {
					if(err) {
						console.log('something is fishy')
					} else {
						console.log(rec)
						if (!rec.length) {
							var newSid = sigIDs[req.param('category')];
						} else {
							var newSid = rec[0].sid + 1;
						}
						
						sigTestDB.insert({
							sid: newSid,
							platform: req.param('platform'),
							category: req.param('category'),
							releases: {}
						}, function(err, result) {
							if (err) {
								console.log('ERROR');
							} else {
								console.log('Done!');
							}
						});

						sigDB.insert({
							sid: newSid,
							index: newSid,
							platform: req.param('platform'),
							name: req.param('signature'),
							detail: req.param('detail'),
							component: req.param('component'),
							category: req.param('category'),
							cmd_type: '',
							customer: '',
							action: req.param('action'),
							command: '',
							dts: req.param('dts'),
							rn: req.param('rn'),
							ta: req.param('ta'),
							fixed: req.param('fix'),
							flag: '',
							level: parseInt(req.param('level')) ? parseInt(req.param('level')) : 6,
							threshold: parseInt(req.param('threshold')) ? parseInt(req.param('threshold')) : 0,
							userid: req.param('userid')
						}, function(err, result) {
							if (err) {
								console.log('ERROR');
							} else {
								var sigObj = {
									sid: newSid,
									index: newSid,
									platform: req.param('platform'),
									name: req.param('signature'),
									detail: req.param('detail'),
									component: req.param('component'),
									category: req.param('category'),
									cmd_type: '',
									customer: '',
									action: req.param('action'),
									command: '',
									dts: req.param('dts'),
									rn: req.param('rn'),
									ta: req.param('ta'),
									fixed: req.param('fix'),
									flag: '',
									level: parseInt(req.param('level')) ? parseInt(req.param('level')) : 6,
									threshold: parseInt(req.param('threshold')) ? parseInt(req.param('threshold')) : 0,
									userid: req.param('userid')
								}
								
								writeToFile('sigs', sigObj, req.param('platform'), newSid, req.param('userid'));
								res.json(sigObj);
							}
						});

						
					}
				})
			}
		});

		
	}

	this.updateSignature = function(req, res) {
		var sid = parseInt(req.param('sid')),
			platform = req.param('platform');

		sigDB.findOne({ sid: sid }, function(err, rec) {
			if (rec) {
				var sigObj = {
					sid: sid,
					index: sid,
					platform: req.param('platform'),
					name: req.param('name'),
					detail: req.param('detail'),
					component: req.param('component'),
					category: req.param('category'),
					cmd_type: '',
					customer: '',
					action: req.param('action'),
					command: '',
					dts: req.param('dts'),
					rn: req.param('rn'),
					ta: req.param('ta'),
					fixed: req.param('fix'),
					flag: '',
					level: parseInt(req.param('level')),
					threshold: parseInt(req.param('threshold'))
				}


				sigDB.update(
					{ sid: sid },
					{
						$set: {
							platform: req.param('platform'),
							name: req.param('name'),
							detail: req.param('detail'),
							component: req.param('component'),
							category: req.param('category'),
							cmd_type: '',
							customer: '',
							action: req.param('action'),
							command: '',
							dts: req.param('dts'),
							rn: req.param('rn'),
							ta: req.param('ta'),
							fixed: req.param('fix'),
							flag: '',
							level: parseInt(req.param('level')),
							threshold: parseInt(req.param('threshold'))
						}
					}
				);
				writeToFile('sigs', sigObj, req.param('platform'), sid, req.param('userid'));

				// writeToFile(sigObj, platform, sid);
				res.json('done')
			}
		})
	}
}