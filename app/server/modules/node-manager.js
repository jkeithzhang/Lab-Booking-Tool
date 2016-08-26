var	nodeDB 		= require('./model').nodes(),
	partDB		= require('./model').parts(),
	typeDB  	= require('./model').types(),
	ntlDB		= require('./model').ntl(),
	ctlDB 		= require('./model').ctl(),
	i 			= require('./assets'),
	ping 		= require('ping'),
	async 		= require('async'),
	fs 			= require('fs');
	exec 		= require('child_process').exec,
	PCRE 		= require('pcre-to-regexp');


module.exports = function(io) {
	

	this.skipPing = function(res) {
		var signatureMatches = {}, sort = {};
		partDB.find({
			sn : {$exists: true} 
		}, {sort: sort}, function(err, cursor) {
			if (err) { console.log('ERRROROROROROROR') }
			else {
				cursor.toArray(function(err, rec) {
					if(err) {
						console.log('something is fishy')
					} else {
						console.log(rec)
						res.json(rec);
					}
				})
			}
		});
	}

	this.pingAllNodes = function(res) {
		// node = {'ip': '138.120.189.151'};

		var allNodes = [], signatureMatches = {};

		var escapeHtml = function(text) {
		 	var map = {
			    '&': '&amp;',
			    '<': '&lt;',
			    '>': '&gt;',
			    '"': '&quot;',
			    "'": '&#039;'
		  	};
		  	return text.replace(/[&<>"']/g, function(m) { return map[m]; });
		}

		var updateNode = function(node) {

			nodeDB.findOne({ip: node.ip}, function(err, rec) {
				if (rec) {
					console.log('NODE>>>>>>>>: ', node)
					nodeDB.update(
						{ip: node.ip},
						{
							$set: {
								type: node.type,
								subnet: node.subnet,
								version: node.version,
								username: node.username ? node.username : 'admin',
								password: node.password ? node.password : 'admin',
								status: node.status,
								position: {
									row: node.position.row ? node.position.row : null,
									rack: node.position.rack ? node.position.rack : null,
									pos: node.position.pos ? node.position.pos : null,
									size: node.position.size ? node.position.size : 7
								}
							}
						}
					);
				} 
			})
		}

		var processNodeInfo = function(node, host, username, password, port, table_name, sigs, callback) {
			var Connection 	= require('ssh2');
			var expect 		= require('stream-expect');
			var defaultPort = 22;
			var c 			= new Connection();

			c.on('connect', function() {
				i._info('conncted to ' + host);
			});

			c.on('ready', function() {
			  	c.shell(function(err, stream) {
				    if (err) throw err
				    /* Use ssh Connection as read and write stream */
					var exp = expect.createExpect(stream);
					
					stream.on('data', function(data, extended) {
						// i._wrap(data)
					});
					stream.on('end', function() {
				      // console.log('Stream :: EOF');
				    });
				    stream.on('close', function() {
				      // console.log('Stream :: close');
				      c.end();
				    });
				    stream.on('exit', function(code, signal) {
				      // console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
				      c.end();
				    });
				    console.log('IP: ' + node.ip)
			  		exp.expect(/\*?[A|B]:.*# /, function(err, output, match) {
			  			/* make sure we do not get hold up by long output */
			  			if (err) console.log('ERR:::', err)
			  			if (match) {
			  				exp.send('env no more' + '\n');
						    exp.expect(/\*?[A|B]:.*# /, function(err, output, match) {
						    	if (err) console.log('ERR:::', err)
						    	if (match) {
						    		exp.send('show version' + '\n');
							    	exp.expect(/\*?[A|B]:.*# /, function(err, output, match) {
							    		if (err) console.log('ERR:::', err)
						    			var regex = /TiMOS-\S+-(\d+\.\d+)/,
							    			match = regex.exec(output);
							    			
							    		if (match) {
							    			
							    			node.version = match[1];
							    			var formatted_release = 'release_'+match[1].replace(/\./g, '_');
							    			console.log('RELEASE: ' + formatted_release)
							    			allNodes.push(node);
							    			exp.send('show card detail'+'\n');

							    			exp.expect(/\*?[A|B]:.*# /, function(err, output, match) {
							    				if (err) console.log('ERR:::', err)
							    				if(output) {
							    					var cmdArr = output.replace(/\n/g, '').split(/\r/);
							    					var cmdOutput = cmdArr.join('_LBR_ ');
							    				} else {
							    					var cmdOutput = output;
							    				}
							    				if(typeof(output) != 'undefined') {
							    					nodesSQL.query('INSERT INTO '+table_name+' VALUES ("show card detail", "'+node.version+'", "'+escapeHtml(cmdOutput)+'", "'+ escapeHtml(JSON.stringify(sigs))+'")')
							    				} else {
							    					console.log('OUPUT >>> '+ node.ip )
							    				}
							    				exp.send('show mda detail'+'\n');

								    			exp.expect(/\*?[A|B]:.*# /, function(err, output, match) {
								    				if (err) console.log('ERR:::', err)
								    				if(output) {
								    					var cmdArr = output.replace(/\n/g, '').split(/\r/);
								    					var cmdOutput = cmdArr.join('_LBR_ ');
								    				} else {
								    					var cmdOutput = output;
								    				}
								    				if(typeof(output) != 'undefined') {
								    					nodesSQL.query('INSERT INTO '+table_name+' VALUES ("show mda detail", "'+node.version+'", "'+escapeHtml(cmdOutput)+'", "'+ escapeHtml(JSON.stringify(sigs))+'")')
								    				} else {
								    					console.log('OUPUT>>> ' + node.ip)
								    				}

								    				exp.send('logout'+'\n');
								    				setTimeout(function() {
								    					callback();
								    				}, 50);
								    			})
							    			})
							    		} else {
							    			console.log('>>>>>>>>>>>>> '+host+' SHOW CARD DETAIL ELSE')
							    			console.log('> '+host+' < ERR: ', err)
											console.log('> '+host+' < OUTPUT: ', output)
											console.log('> '+host+' < MATCH: ', match)

							    			setTimeout(function() {
						    					callback();
						    				}, 50);
							    		}
							    	});
								} else {
									console.log('>>>>>>>>>>>>> '+host+' SHOW VERSION ELSE')
					    			console.log('> '+host+' < ERR: ', err)
									console.log('> '+host+' < OUTPUT: ', output)
									console.log('> '+host+' < MATCH: ', match)
									
									callback();
								} 
					    	});
						} else {
							console.log('>>>>>>>>>>>>> '+host+' ENV NO MORE ELSE')
							console.log('> '+host+' < ERR: ', err)
							console.log('> '+host+' < OUTPUT: ', output)
							console.log('> '+host+' < MATCH: ', match)
							callback();
						} 
					    
				  	});
			  	});
			});

			c.on('error', function(err) {
			  	i._err('Connection :: error :: ' + err);
			  	nodesSQL.query('INSERT INTO '+table_name+' VALUES ("'+err+'", "", "", "")');
			});
			c.on('end', function() {
			  	i._info('Connection :: end');
			});
			c.on('close', function(had_error) {
			  	i._info('Connection :: close');
			});
			
			c.connect({
				host: host,
				port: port ? port : defaultPort,
				username: username ? username : 'admin',
				password: password ? password : 'admin'
			});
		}

		sigSQL.query('SELECT * FROM sigTests WHERE sigID REGEXP "7x50_sig_52[4-6]"', function(err, rows) {
			var sigs = [];
			for(index in rows) {
				sigObj = rows[index];
				sigs.push(JSON.parse(sigObj.sigData));
			}
			// console.log(sigs)
			nodeDB.find({ ip : {$exists: true} }, function(err, cursor) {
				cursor.toArray(function(err, rec) {
					async.eachSeries(rec, function(node, callback) {
						ping.sys.probe(node.ip, function(isAlive) {
							node.status = isAlive ? 'live' : 'dead';
					    	if(isAlive) {

					    		if (/SR|XRS|ESS/.test(node.type)) {
					    			var table_name = node.ip.replace(/\./g, '_');

						    		nodesSQL.query('DROP TABLE IF EXISTS '+table_name);
									nodesSQL.query('CREATE TABLE '+table_name+' (cmd VARCHAR(100), version VARCHAR(10), content LONGTEXT, sigs TEXT)', function(err, rows) {});

									async.eachSeries([node], function(node, callback) {
						    			processNodeInfo(node, node.ip, node.username, node.password, '22', table_name, sigs, callback);
						    		}, function(err, results){
						    			if (err) { console.log(err) }
										else {
											console.log('done:', node.ip)
											// console.log(allNodes)
											// allNodes.forEach(function(node) {
											// 	updateNode(node);
											// });
											// res.json(isAlive)	
										}
						    		})
					    		} else {
					    			console.log(node.ip + '['+node.type+']' + ' is not SR')
					    			nodesSQL.query('DROP TABLE IF EXISTS '+table_name);
									nodesSQL.query('CREATE TABLE '+table_name+' (cmd VARCHAR(100), version VARCHAR(10), content LONGTEXT, sigs TEXT)', function(err, rows) {});
									nodesSQL.query('INSERT INTO '+table_name+' VALUES ("'+node.type+'", "", "", "")');
					    		}
					    		
					    	} else {
					    		console.log(node.ip + ' OFFLINE')
					    		nodesSQL.query('DROP TABLE IF EXISTS '+table_name);
								nodesSQL.query('CREATE TABLE '+table_name+' (cmd VARCHAR(100), version VARCHAR(10), content LONGTEXT, sigs TEXT)', function(err, rows) {});
								nodesSQL.query('INSERT INTO '+table_name+' VALUES ("offline", "", "", "")');
						    				

					    	}
							callback();
					    	
					    })
					}, function() {
						console.log('WAIT FOR 120 SECONDS for the MySQL contents to be settled...')
						// 
						// 
						setTimeout(function() {
							console.log('done done done done')
							var updatePart = function(card, ip) {
								var type = '';
								if (card.equipped && card.equipped != card.provisioned) {
									type = card.equipped+'/'+card.provisioned;
								} else {
									type = card.provisioned;
								}
								nodeDB.findOne({ip: ip}, function(err, rec) {
									delete rec.cards;
									partDB.update(
										{ sn: card.sn },
										{
											$set: {
												'slot': card.slot,
												'type': type,
												'oper': card.oper,
												'sn': card.sn,
												'tolb': card.tolb,
												'temp': card.temp,
												'ip': rec.ip,
												'version': rec.version,
												'owner': rec.owner,
												'endDate': rec.endDate,
												'node': rec
											}
										},
										{ upsert: true }
									)
								});
							}
							new RP().nodeInfo(signatureMatches, function(signatureMatches) {
								console.log("nodeInfo has been triggered");
								res.json(signatureMatches)

								for(index in signatureMatches) {
									if (typeof(signatureMatches[index]) != 'object') {
										console.log(typeof(signatureMatches[index]))
									} else if(index != 'undefined') {
										var ip = index.replace(/_/g, '.');
										var ln = signatureMatches[index];
										var ioms = ln['524'] ? ln['524'] : {}, 
											cpms = ln['525'] ? ln['525'] : {}, 
											mdas = ln['526'] ? ln['526'] : {};

										var thisNode = [];
										if(typeof(ioms.Card) != 'undefined') {
											for(var iomIndex=0; iomIndex<ioms.Card.length; iomIndex++) {
												var thisIom = {};
												thisIom.slot 		= ioms.Card[iomIndex];
												thisIom.equipped 	= ioms.Equipped[iomIndex];
												thisIom.provisioned = ioms.Provisioned[iomIndex];
												thisIom.admin 		= ioms.Admin[iomIndex];
												thisIom.oper 		= ioms.Oper[iomIndex];
												thisIom.sn 			= ioms.SN[iomIndex];
												thisIom.tolb 		= ioms.Time_of_last_boot[iomIndex];
												thisIom.temp		= ioms.Temperature[iomIndex];

												thisNode.push(thisIom);
												if(thisIom.sn) updatePart(thisIom, ip);
											}
										} else {
											console.log(ip + ' ---> IOM')
										}
										if(typeof(cpms.Card) != 'undefined') {
											for(var cpmIndex=0; cpmIndex<cpms.Card.length; cpmIndex++) {
												var thisCPM = {};
												thisCPM.slot 		= cpms.Card[cpmIndex];
												thisCPM.equipped 	= cpms.Equipped[cpmIndex];
												thisCPM.provisioned = cpms.Provisioned[cpmIndex];
												thisCPM.admin 		= cpms.Admin[cpmIndex];
												thisCPM.oper 		= cpms.Oper[cpmIndex];
												thisCPM.sn 			= cpms.SN[cpmIndex];
												thisCPM.tolb 		= cpms.Time_of_last_boot[cpmIndex];
												thisCPM.temp		= cpms.Temperature[cpmIndex];

												thisNode.push(thisCPM);
												if(thisCPM.sn) updatePart(thisCPM, ip);
											}
										} else {
											console.log(ip+ ' ---> CPM')
										}

										if(typeof(mdas.Slot) != 'undefined') {
											for(var mdaIndex=0; mdaIndex<mdas.Slot.length; mdaIndex++) {
												var thisMDA = {};
												thisMDA.slot 		= mdas.Slot[mdaIndex] + '/' + mdas.MDA[mdaIndex];
												thisMDA.equipped 	= mdas.Equipped[mdaIndex];
												thisMDA.provisioned = mdas.Provisioned[mdaIndex];
												thisMDA.admin 		= mdas.Admin[mdaIndex];
												thisMDA.oper 		= mdas.Oper[mdaIndex];
												thisMDA.sn 			= mdas.SN[mdaIndex];
												thisMDA.tolb 		= mdas.Time_of_last_boot[mdaIndex];
												thisMDA.temp		= mdas.Temperature[mdaIndex];

												thisNode.push(thisMDA);
												if(thisMDA.sn) updatePart(thisMDA, ip);						
											}
										} else {
											console.log(ip + ' ---> MDA')
										}

										nodeDB.update(
											{ip: ip},
											{
												$set: {
													"cards": thisNode
												}
											},
											{ upsert: true }
										);
									}
								}
							})
						}, 120000);
					})
				})
			})
		});
	}
	this.pingNode = function(node, res) {
		var allNodes = [];

		var updateNode = function(node) {

			nodeDB.findOne({ip: node.ip}, function(err, rec) {
				if (rec) {
					console.log('NODE>>>>>>>>: ', node)
					nodeDB.update(
						{ip: node.ip},
						{
							$set: {
								type: node.type,
								subnet: node.subnet,
								version: node.version,
								username: node.username ? node.username : 'admin',
								password: node.password ? node.password : 'admin',
								status: node.status,
								position: {
									row: node.position.row ? node.position.row : null,
									rack: node.position.rack ? node.position.rack : null,
									pos: node.position.pos ? node.position.pos : null,
									size: node.position.size ? node.position.size : 7
								}
							}
						}
					);
				} 
			})
		}

		var processNodeInfo = function(node, host, username, password, port, callback) {
			var Connection 	= require('ssh2');
			var expect 		= require('stream-expect');
			var defaultPort = 22;
			var c 			= new Connection();

			c.on('connect', function() {
				i._info('conncted to ' + host);
			});

			c.on('ready', function() {
			  	c.shell(function(err, stream) {
				    if (err) throw err
				    /* Use ssh Connection as read and write stream */
					var exp = expect.createExpect(stream);
					
					stream.on('data', function(data, extended) {
						// i._wrap(data)
					});
					stream.on('end', function() {
				      // console.log('Stream :: EOF');
				    });
				    stream.on('close', function() {
				      // console.log('Stream :: close');
				      c.end();
				    });
				    stream.on('exit', function(code, signal) {
				      // console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
				      c.end();
				    });

				  	exp.expect(/\*?[A|B]:.*# /, function(err, output, match) {
				  		// if(err) console.log('expect ERROR: ' +  err)
				  		// else {
				  			/* make sure we do not get hold up by long output */
						    exp.send('env no more' + '\n');
						    exp.expect(/\*?[A|B]:.*# /, function(err, output, match) {
						    	// if(err) console.log('expect ERROR: ' +  err)
						    	// else {
						    		exp.send('show version' + '\n');
							    	exp.expect(/\*?[A|B]:.*# /, function(err, output, match) {
							    		// if(err) console.log('expect ERROR: ' + err)
							    		// else {
							    			var regex = /TiMOS-\S-(\S+)/,
								    			match = regex.exec(output);
								    		if (match) {
								    			node.version = match[1];
								    			allNodes.push(node);
								    			callback();
								    			// c.end();
								    		}
							    		// }
							    	});
						    	// }
					    	});
				  		// }
				  	});
			  	});
			});

			c.on('error', function(err) {
			  	i._err('Connection :: error :: ' + err);
			});
			c.on('end', function() {
			  	i._info('Connection :: end');
			});
			c.on('close', function(had_error) {
			  	i._info('Connection :: close');
			});
			
			c.connect({
				host: host,
				port: port ? port : defaultPort,
				username: username,
				password: password
			});
		}

		ping.sys.probe(node.ip, function(isAlive) {
			node.status = isAlive ? 'live' : 'dead';
	    	if(isAlive) {
	    		console.log(node.ip + ' is alive')
				async.eachSeries([node], function(node, callback) {
	    			processNodeInfo(node, node.ip, node.username, node.password, '22', callback);
	    		}, function(err, results){
	    			if (err) { console.log(err) }
					else {
						console.log(node)
						console.log(allNodes)
						allNodes.forEach(function(node) {
							updateNode(node);
						});
						res.json(isAlive)
					}
	    		})
	    	} else {
	    		console.log('some how I am here...')
	    		console.log(node)
	    		res.json(isAlive);
	    	}
	    	
	    });
	}
	this.loadNodes = function(me, login, filter, sort, res) {
		console.log('>>>>>>>>>>>>>>>', login)
		var query = '';
		switch(filter) {
			case 'free':
				nodeDB.find({ 
					owner : {$exists: false} 
				}, function(err, cursor) {
					cursor.toArray(function(err, rec) {
						res.json(rec);
					})
				});
				break;
			case 'busy':
				nodeDB.find({ 
					owner : {$exists: true} 
				}, function(err, cursor) {
					cursor.toArray(function(err, rec) {
						res.json(rec);
					})
				});
				break;
			case 'mine':
				var owner = login;
				nodeDB.find({ 
					owner: owner
				}, function(err, cursor) {
					cursor.toArray(function(err, rec) {
						res.json(rec);
					})
				});
				break;
			case 'all':
				nodeDB.find({
					ip : {$exists: true} 
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
				break;
			case 'config':
				nodeDB.find({
					ip : {$exists: true} 
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
			default:
				
		}
	}
	this.releaseNode = function(node, options, res) {
		// console.log("herehereherehere: ", options);
		nodeDB.update(
			{
				ip: node.ip
			}, 
			{
				$unset: {
					owner: "",
					start: "",
					end: "",
					startDate: "",
					endDate: "",
					ownerObj: ""
				}
			},
			function(err, result) {
				if (err) {
					console.log(err)
				} else {
					partDB.update(
						{
							"ip": node.ip
						}, 
						{
							$set: {
								"owner": null
							}
						}, 
						{
							multi: true
						}, function(err, result){
								var currentTime = new Date().getTime();
								ntlDB.update(
									{
										"log": {
											"$elemMatch": {
												"end": options.end
											}
										} 
									},
									{$set: 
										{
											"log.$.end": currentTime
										}
									}, function(err, result) {
									   		console.log('success');
								});

								partDB.find({"node.ip": node.ip}, function(err, cursor) {
									if (err) { console.log('ERRROROROROROROR') }
									else {
										cursor.toArray(function(err, rec) {
											if(err) {
												console.log('something is fishy')
											} else {
												if(rec.length != 0) {
													async.eachSeries(rec, function(recc, callback){
														ctlDB.update(
															{
																"sn": recc.sn,
																"log": {
																	"$elemMatch": {
																		"end": options.end
																	}														
																}
															},
															{$set:
																{
																	"log.$.end": currentTime
																}
															}, function(err, result) {
															   		console.log("flag");																			
														});
														callback();
													}, function(err, result){
														//do something?
													});
												}
											}
										})
									}
								});
						});		 	
					io.sockets.emit('broadcast', {
						msg: 'loadNodes'
					});
					res.json('done')
				}
			}
		);
	}
	this.curlReminder = function(checkDate1, checkDate2, type, MAIL) {
		nodeDB.find({ 
			endDate: {$exists: true}
		}, function(err, cursor) {
			var msg = '',
				sender 	= 'T3C laBook',
				subject = 'NODE ' + type + ': ';
			var tos = {};
			cursor.toArray(function(err, rec) {
				async.eachSeries(rec, function(node, callback){
					var nodeEnd = new Date(node.endDate).getTime(),
						checkTime1 = new Date(checkDate1).getTime(),
						checkTime2 = new Date(checkDate2).getTime();
					// console.log('checkTime1: '+checkTime1);
					// console.log('checkTime2: '+checkTime2);
					// console.log(nodeEnd-checkTime1);
					if (nodeEnd-checkTime1<259200000) {
						var email = node.ownerObj.email;
						var endDate = node.endDate;
						if (typeof(tos[email]) == 'undefined') tos[email] = {};
						if (typeof(tos[email][endDate]) == 'undefined') tos[email][endDate] = [];

						tos[email][endDate].push(node.ip);
					}
					callback();
				}, function(err, result) {
					for(email in tos) {
						var msg = '<html><head><link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Open+Sans:400,300,700"><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">',
							subject = 'NODE ' + type;

						msg+='Hi, '+'<br><br>'+'This is an automated message, the following nodes under your name are about to expire, please log on Labook to release the node before they expire:'+'<br><br>';
						for(date in tos[email]) {						
							for(index in tos[email][date]) {
								msg+='<b>'+tos[email][date][index]+'</b>, expire on: '+date+'<br>';
							}
						}
						msg+='<br><p style="color:purple">Note that Labook will clear your nodes automatically once the nodes passed end date, if you found any bugs or errors in T3C labook, please report to Ke Zhang (ke.zhang@alcatel-lucent.com), thank you!</p>';
						// console.log('php app/server/library/sendmail.php '+email+' '+subject+' '+msg);
						exec('php app/server/library/sendmail.php '+"'"+email+"'"+' '+"'"+subject+"'"+' '+"'"+msg+"'", function(err, stdout, stderr) { 
							console.log(stdout);
						});						
					}
				});
			});
		});
	}
	this.sendReminder = function(checkDate1, checkDate2, type, MAIL) {
		nodeDB.find({ 
			endDate: {$exists: true}
		}, function(err, cursor) {
			var msg = '',
				sender 	= 'T3C laBook',
				subject = 'NODE ' + type + ': ';
			var tos = {};
			cursor.toArray(function(err, rec) {
				async.eachSeries(rec, function(node, callback){
					var nodeEnd = new Date(node.endDate).getTime(),
						checkTime1 = new Date(checkDate1).getTime(),
						checkTime2 = new Date(checkDate2).getTime();

					if (nodeEnd <= checkTime1 || nodeEnd <= checkTime2) {
						var email = node.ownerObj.email;
						var endDate = node.endDate;
						if (typeof(tos[email]) == 'undefined') tos[email] = {};
						if (typeof(tos[email][endDate]) == 'undefined') tos[email][endDate] = [];

						tos[email][endDate].push(node.ip);
					}
					callback();
				}, function(err, result) {
					for(email in tos) {
						var msg = '<html><head><link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Open+Sans:400,300,700"><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">',
							sender 	= 'T3C laBook',
							subject = 'NODE ' + type;
						msg += '<style>body { font-family: Open Sans,Lucida Sans Unicode,Lucida Grande,sans-serif; font-weight: 200;} </style></head><body>';

						for(date in tos[email]) {
							msg += '<div class=\'panel panel-info\'><div class=\'panel-heading\'><h3 class=\'panel-title\'>'+date+'</h3></div><div class=\'panel-body\'>';
							for(index in tos[email][date]) {
								msg += tos[email][date][index]+'<BR>';
							}
							msg += '</div></div>';
						}
						msg += '<footer><div class=\'container\'>To change your booking: <a href=\'http://138.120.135.41:3000/book#/loadNodes/free\'>laBook</a></div></footer></body></html>';
						new MAIL().sendMail(sender, email, subject, msg, function(output) {
							// res.json(toReturn);
						});
					}
				});
			});
		});
	}
	this.releaseNodes = function(checkDate) {
		nodeDB.find({ 
			endDate: {$exists: true}
		}, function(err, cursor) {
			cursor.toArray(function(err, rec) {
				rec.forEach(function(node) {
					var nodeEnd = new Date(node.endDate).getTime(),
						checkTime = new Date(checkDate).getTime();
					if (nodeEnd <= checkTime) {
						console.log('releasing nodes: ' + node.ip + '...')
						nodeDB.update(
							{
								ip: node.ip
							}, 
							{
								$unset: {
									owner: "",
									start: "",
									end: "",
									startDate: "",
									endDate: "",
									ownerObj: ""
								}
							},
							function(err, result) {
								if (err) {
									console.log(err)
								} else {
									io.sockets.emit('broadcast', {
										msg: 'release',
										node: node.ip
									});
								}
							}
						);
					}
				})
			});
		});
	}
	this.bookNode = function(node, owner, options, res) {

		var prettify = function(dateStr) {
			return dateStr.replace(/T.*/, '');
		};

		nodeDB.update(
			{ ip: node.ip }, 
			{
				$set: {
					owner: owner.login,
					start: options.start,
					end: options.end,
					startDate: prettify(options.start),
					endDate: prettify(options.end),
					ownerObj: owner
				}
			},
			{ upsert: true },
			function(err, result) {
				if (err) {
					console.log(err)
				} else {
					partDB.update(
						{
							"ip": node.ip
						}, 
						{
							$set: {
								"owner": owner.login
							}
						}, 
						{
							multi: true
						}, function(err, result){
								ntlDB.findOne({ip: node.ip}, function(err, result) {
									if (!result) {
										ntlDB.insert(
											{
												ip: node.ip,
												log: [
													{ 
														start: options.start,
														owner: owner.login,
														end: options.end
													}
												] 
											}
										)
									} else {
										ntlDB.update(
											{ ip: node.ip},
											{
												$push: {
													log: {
														start: options.start,
														owner: owner.login,
														end: options.end
													}
												}
											}
										)
									}
								});
								partDB.find({"node.ip": node.ip}, function(err, cursor) {
									if (err) { console.log('ERRROROROROROROR') }
									else {
										console.log('omg');
										cursor.toArray(function(err, rec) {
											if(err) {
												console.log('something is fishy')
											} else {
												if(rec.length != 0) {
													async.eachSeries(rec, function(recc, callback){
														ctlDB.findOne({sn: recc.sn}, function(err, result) {
															console.log('test test out', recc);
															if (!result) {
																ctlDB.insert(
																	{
																		sn: recc.sn,
																		log: [
																			{ 
																				start: options.start,
																				nodeIP: recc.ip,
																				owner: owner.login,
																				end: options.end
																			}
																		] 
																	}
																)
															} else {
																ctlDB.update(
																	{ sn: recc.sn},
																	{
																		$push: {
																			log: {
																				start: options.start,
																				nodeIP: recc.ip,
																				owner: owner.login,
																				end: options.end
																			}
																		}
																	}
																)
															}												
														});
														callback();
													}, function(err, result){
														console.log(">>>>>", result);
													});
												}
											}
										})
									}
								});
						});					
					io.sockets.emit('broadcast', {
						msg: 'loadNodes'
					});
					res.json('done')
				}
			}
		);
	}
	this.updateNode = function(node, res) {
		nodeDB.update(
			{
				ip: node.ip
			}, 
			{
				$set: {
					ip: node.ip,
					type: node.type,
					version: node.version,
					username: node.username,
					password: node.password,
					"position.row": parseInt(node.position.row),
					"position.rack": parseInt(node.position.rack),
					"position.pos": parseInt(node.position.pos),
					"position.size": parseInt(node.position.size)
				}
			},
			{
				upsert: true
			},
			function(err, result) {
				if (err) {
					console.log(err)
				} else {
					io.sockets.emit('broadcast', {
						msg: 'loadNodes'
					});
					res.json('done')
				}
				
			}
		);
	}
	this.addNode = function(node, res) {
		nodeDB.find({ip: node.ip}, function(err, cursor) {
			cursor.toArray(function(err, rec) {
				if(rec.length) {
					res.json({error: 'IP exists'})
				} else {
					console.log(node)
					nodeDB.insert({
						ip: node.ip,
						type: node.type.type,
						username: node.username,
						password: node.password,
						status: 'dead',
						position: {
							row: node.position.row,
							rack: node.position.rack,
							pos: node.position.pos,
							size: node.position.size
						},
						version: ''
					});
					typeDB.insert({
						type: node.type.type,
						size: node.position.size
					});
					res.json('done')
				}
			})
		});
	}
	this.removeNode = function(node, res) {
		nodeDB.findOne({ip: node.ip}, function(err, result) {
			if (result) {
				nodeDB.remove({ip: node.ip}, function(e, cur) {
					if (e) {
						console.log('error');
						res.json({error: 'There is an error occur when trying to remove the node!'});
					} else {
						res.json('done');
					}
				});
			} else {
				res.json({error: 'Error, IP doese not exist!'});
			}
		});
	}
	this.getNodeLog = function(ip, res) {
		ntlDB.findOne({ip:ip}, function(err, result) {
			res.json(result);
		})
	}
	this.getAllNodeLogRegistry = function(res) {
		var registries = {};
		ntlDB.find({}, function(err, cursor) {
			cursor.toArray(function(err, rec) {
				for(index in rec) {
					var obj = rec[index];
					registries[obj.ip] = 1;
				}
				res.json(registries);
			})
		});
	}
	this.searchNode = function(res, inputSearch) {
		var flag = false;
		var array = [];
		var arr_formatter = [];

		var SSHClient = require('ssh2');
		var expect = require('stream-expect');
		var conn = new SSHClient();

		conn.on('ready', function(){
        	console.log('Client : : Ready');
			conn.shell(function(err,stream){
				if (err) throw err;
				var conv = expect.createExpect(stream);
				stream.on('close',function() {
					console.log('Stream : : Closed');
					conn.end();
				}).on('data', function(data){
					if(flag){
						var pattern =  /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}.*\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
						var pattern_short = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
						var error_pattern = /Invalid entry/;
						var textChunk = data.toString('utf8');

						if (pattern.test(textChunk)) {
							arr_formatter = textChunk.split("#SVD#");
							for (var i = 0; i < arr_formatter.length; i++){
								array.push(arr_formatter[i]);
							}
							arr_formatter = [];
						} else if (pattern_short.test(textChunk)) {
							array.push(textChunk);
						}
					}
				});

				conv.expect(/root@localhost/, function(err, output, match) {
					if(err) console.log('ERR:::', err);
					var script_dir_exec = 'cd /root/Amir/restricted';
					var script_name_exec = './prompt.sh';

					if(match) {
						conv.send(script_dir_exec + '\n');
						conv.expect(/root@localhost/,function(err,output,match) {
							if (err) console.log('ERR:::',err);
							if (match) {
								conv.send(script_name_exec + ' ' + inputSearch + ' \n');
								conv.expect(/You\shave\sentered|Invalid\sentry/,function(err,output,match){
									if (err) console.log('ERR:::',err);
									if (match && !(/Invalid\sentry/.test(output))) {
										console.log('BINGO!!!');
										flag = true;
										setTimeout(function() {
											stream.end();
											conn.end();
											res.send(array);
										}, 500);
									} else if (match && /Invalid\sentry/.test(output)) {
										var err_message = 'Invalid entry';
										stream.end();
										conn.end();
										res.send(err_message);
									}
								});
							}
						});
					}
				});
			});
		}).connect({
			host: '138.120.216.111',
			port: 22,
			username: 'root',
			password: 'admin1'
		});
	}
	this.getDate = function(res) {
		var path = process.cwd()+'/snapshot_city.txt';
		var fs = require('fs');
		fs.readFile(path, function read(err,data) {
			if (err) throw err;
			res.send(data.toString('utf8'));
		});
	}
}
