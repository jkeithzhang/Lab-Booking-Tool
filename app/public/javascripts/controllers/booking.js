angular.module('bookingController')
	.controller('userAuthCtl', ['$scope', '$http', 'Scan', 'mySocket', '$location',
		function($scope, $http, Scan, mySocket, $location) {
			$scope.login = function(info) {
				$scope.user.authenticated = true;
				$scope.user.authorized = true;
				Scan.login(info.csl, info.cip)
					.success(function(data) {
						console.log("--->"+JSON.stringify(data));
						history.back();
						setTimeout(function() {
							window.location.reload();
						}, 100);
					})
					.error(function(data) {
						console.log("ERROR : " + data);
					})
			}
		}
	])
	.controller('getNodeList', ['$scope', '$http', 'Scan', 'mySocket', '$location',
		function($scope, $http, Scan, mySocket, $location) {
			$scope.getNodeList = function() {
				Scan.get()
					.success(function(data) {
						// console.log(data)
						// console.log($scope.udata)
						$scope.nodeList = data;

						$scope.free = [],
						$scope.busy = [],
						$scope.mine = [];
					}) 
					.error(function(data) {
						console.log("ERROR : " + data);
					});
			}
			$scope.getNodeList();
		}
	])
	.controller('loadNode', ['$scope', '$http', 'Load', '$location', '$q', '$routeParams', 'mySharedService', 'mySocket', 'ngTableParams', '$filter',
		function($scope, $http, Load, $location, $q, $routeParams, mySharedService, mySocket, ngTableParams, $filter) {
			var filter = $routeParams.filter;
			
			$scope.getAllNodeLogRegistry = function() {
				Load.getAllNodeLogRegistry()
					.success(function(result) {
						console.log(result)
						$scope.allNodeLogs = result;
					})
			}
			$scope.hasLog = function(ip) {
				if(typeof($scope.allNodeLogs[ip]) == 'undefined') return false;
				return true;
			}

			$scope.getHistory = function(node) {
				// console.log(node)
				Load.getNodeLog(node.ip)
					.success(function(result) {
						// logThis(result)
						//Convert datetime format
						for(var index in result['log']) {
							for(i in result['log'][index]) {
								if(i == 'start') {
									result['log'][index][i] = new Date(result['log'][index][i]).toLocaleDateString();
								} else if(i == 'end') {
									if(new Date().getTime() < new Date(result['log'][index][i]).getTime()) {
										result['log'][index][i] = new Date(result['log'][index][i]).toLocaleDateString() + ' (in use now)';
									} else {
										result['log'][index][i] = new Date(result['log'][index][i]).toLocaleDateString();
									}
								}
							}
						}
						$scope.history = result;					
					})
			}
			$scope.noPastDates = function(d) {
			  var today = new Date();

			  // Set to the beginning of the day
			  today.setHours(0);
			  today.setMinutes(0);
			  today.setSeconds(0);
			  today.setMilliseconds(0);

			  // Return comparison: not before and after 30 days
			  return (d >= today && (((d-today)/30) < 86400000));
			};

			$scope.editable = function(node) {
				if (node.hasOwnProperty('owner')) {
					return false;
				}
				return true;
			}

			$scope.isActive = function(route) {
				return route === $location.path();
			}
			$scope.loadNodeList = function() {
				$scope.structuredNodes = {};
				var structuredNodes = {};

				var loadUser = function() {
					var deferred = $q.defer();
					setTimeout(function() {
						deferred.resolve($scope.user)
					}, 50);
					return deferred.promise;
				}
				
				loadUser()
					.then(function(result) {
						if(typeof($scope.user) == 'string') {
							$scope.user = 'empty';
						}
						console.log('>>>>>>>'+filter); //here
						console.log('crap::::::'+$scope.user);
						Load.get(filter, $scope.user, {})
							.success(function(data) {
								$scope.filter = filter;
								// $scope.nodeList = data;
								// for(i in data) {
								// 	var row 	= data[i].position.row,
								// 		rack 	= data[i].position.rack,
								// 		type	= data[i].type,
								// 		ipString = data[i].ip;

								// 	if(!structuredNodes[row]) {
								// 		structuredNodes[row] = {};
								// 		structuredNodes[row][rack] = [];
								// 	} else if (!structuredNodes[row][rack]) {
								// 		structuredNodes[row][rack] = [];
								// 	}
								// 	structuredNodes[row][rack].push(data[i]);
								// }
								// $scope.rows = Object.keys(structuredNodes);
								// $scope.structuredNodes = structuredNodes;

								for (var i = 0; i < data.length; i++) {
									data[i].row = '';
									data[i].rack = '';
									data[i].name = '';
									data[i].row = parseInt(data[i].position.row);
									data[i].rack = parseInt(data[i].position.rack);
									if (data[i].ownerObj && data[i].ownerObj.first_name && data[i].ownerObj.last_name) {
										data[i].name = data[i].ownerObj.first_name + ' ' + data[i].ownerObj.last_name;
									}
								}

								$scope.tableParams = new ngTableParams({
									page: 1,            // show first page
									count: data.length,          // count per page
									sorting: {
										'row': 'asc'     // initial sorting
									}
								}, {
									// total: data.length, // length of data
									counts: [],
									getData: function($defer, params) {
										// use build-in angular filter
										var filteredData = params.filter() ? $filter('filter')(data, params.filter()) : data;
										var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : data;

										params.total(orderedData.length); // set total for recalc pagination
										$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
									}
								});
							})
							.error(function(data) {
								console.log("ERROR : " + data);
							});
					})
			}

			$scope.connectNode = function(node)	{
				// console.log('>>>>>> '+JSON.stringify(node));
				// console.log($scope.user);
				var socketSuffix = ($scope.user.authenticated) ? $scope.user.login : null;
				if (socketSuffix) {
					mySocket.forward(socketSuffix);
					mySocket.emit('conn_node', {node: node, uid: socketSuffix});

					var formatOutput = function(prompt, cmd, output) {
						return prompt + ' ' + output + '\n';
					}
					$scope.sendCommand = function(cli) {
						mySocket.emit('sendchat', {cmd: cli, uid: socketSuffix});
						// $scope.cliCommand.text = '';
					}
					$scope.$on('socket:'+socketSuffix, function(event, data) {
						if (data.init) {
							mySocket.emit('sendchat', {cmd: 'env no more', uid: socketSuffix});
						} else {
							// if (cliPanelContents.indexOf(formatOutput(data.prompt, data.cmd, data.output)) < 0) {
							// 	$scope.cliPanel = $scope.cliPanel + formatOutput(data.prompt, data.cmd, data.output);
							// 	cliPanelContents.push(formatOutput(data.prompt, data.cmd, data.output))
							// }
						}
					})
				}
			}

			$scope.$on('handleBroadcast', function() {
				if (mySharedService.message == 'refreshNodeList') {
					$scope.loadNodeList();
				}
			});
			$scope.$on('socket:broadcast', function(event, data) {
				if (data.msg == 'loadNodes') {
					console.log(data)
					$scope.loadNodeList();
				}
			});
			$scope.$on('socket:broadcast', function(event, data) {
				if (data.msg == 'release') {
					console.log('weeee: '+data.node);
					$scope.connectNode(data.node);
					$scope.sendCommand('configure system login-control motd text ">>> laBook Notice:: This node is available now! <<<"');					
					$scope.loadNodeList();
				}
			});
			$scope.loadNodeList();
		}
	])
	.controller('nodeBookingCtrl', ['$scope', 'Book', 'mySharedService', 'flash', 'Load', 'mySocket',
		function($scope, Book, mySharedService, flash, Load, mySocket) {			
			$scope.showTypePanel = false;			
			$scope.newObj = {};

			$scope.showAddTypePanel = function() {
				$scope.showTypePanel = true;
			}
			$scope.hideAddTypePanel = function() {
				$scope.showTypePanel = false;
			}
			$scope.addNewType = function() {
				console.log("called addNewType() already");
				var type = $scope.newObj.newType;
				var size = $scope.newObj.newSize;
				console.log(type, size)
				$scope.items.push({'type': type, 'size': size});
				console.log($scope.items)
				$scope.showTypePanel = false;
			}

			$scope.addNode = function(node) {
				Book.add(node)
					.success(function(data) {
						if(data.error) {
							flash.error = 'IP: ' + node.ip + ' exists already!';
						} else {
							flash.success = 'IP: ' + node.ip + ' has been added!';
						}

					})
					.error(function(data) {
						console.log(data)
					})
			}

			$scope.removeNode = function(node) {
				Book.remove(node)
					.success(function(data) {
						if (data.error) {
							flash.error = data.error;
						} else {
							flash.success = 'IP: ' + node.ip + ' is removed!';
						}
					})
					.error(function(data) {
						console.log(data)
					});
			}

			$scope.parseType = function() {
				Load.getType()
					.success(function(data) {
						$scope.items = [];
						data.forEach(function(e) {
							$scope.items.push({'type': e.type, 'size': e.size});
							// $scope.typeSize[e.type] = e.size;
						});
						console.log('arrived parseType', data);
					})
					.error(function() {
						alert("Something bad happend!");
					});
			}

			$scope.changeSize = function(node) {
				if(!node.position) {
					node.position = {};
				}
				node.position.size = node.type.size;
				$scope.node = node;
			}

			$scope.bookMe = function(node) {
				console.log($scope.user);
				Book.post(node, $scope.user, 'book', {start: $scope.startDate, end: $scope.endDate}) 
					.success(function(data) {
						// mySharedService.prepForBroadcast('refreshNodeList');
						flash.success = 'Node: ' + node.ip + ' has been booked from ' + $scope.startDate + ' to ' + $scope.endDate + '!';
						setTimeout(function() {
							$scope.connectNode(node);
							$scope.sendCommand('configure system login-control motd text ">>> laBook Notice:: This node booked by: ' +  $scope.user.first_name + ' ' + $scope.user.last_name + ' [From: ' + String($scope.startDate).substr(4, 17) + ' EST' + ' To: ' + String($scope.endDate).substr(4, 17) + ' EST' + '] ::laBook Notice <<<"');
							flash.message = '';
							$scope.$hide();
						}, 50);
					})
					.error(function(data) {
						console.log("ERROR : " + data);
					});
			}

			$scope.updateMe = function(node) {
				Book.update(node) 
					.success(function(data) {
						// mySharedService.prepForBroadcast('refreshNodeList');
						flash.success = 'Node: ' + node.ip + ' has been successfully updated!';
						setTimeout(function() {
							flash.message = '';
							$scope.$hide();
						}, 50);
					})
					.error(function(data) {
						console.log("ERROR : " + data);
					});
			}

			$scope.releaseMe = function(node) {
				Book.post(node, $scope.user, 'release', {start: $scope.startDate, end: $scope.endDate}) 
					.success(function(data) {
						// mySharedService.prepForBroadcast('refreshNodeList');
						flash.success = 'Node: ' + node.ip + ' has been released to the booking pool!';
						setTimeout(function() {
							$scope.connectNode(node);
							$scope.sendCommand('configure system login-control motd text ">>> laBook Notice:: This node is available now! <<<"');
							flash.message = '';
							$scope.$hide();
						}, 50);
					})
					.error(function(data) {
						console.log("ERROR : " + data);
					});
				
			}

			$scope.connectNode = function(node)	{
				// console.log('>>>>>> '+JSON.stringify(node));
				// console.log($scope.user);
				var socketSuffix = ($scope.user.authenticated) ? $scope.user.login : null;
				if (socketSuffix) {
					mySocket.forward(socketSuffix);
					mySocket.emit('conn_node', {node: node, uid: socketSuffix});

					var formatOutput = function(prompt, cmd, output) {
						return prompt + ' ' + output + '\n';
					}
					$scope.sendCommand = function(cli) {
						mySocket.emit('sendchat', {cmd: cli, uid: socketSuffix});
						// $scope.cliCommand.text = '';
					}
					$scope.$on('socket:'+socketSuffix, function(event, data) {
						if (data.init) {
							mySocket.emit('sendchat', {cmd: 'env no more', uid: socketSuffix});
						} else {
							if (cliPanelContents.indexOf(formatOutput(data.prompt, data.cmd, data.output)) < 0) {
								$scope.cliPanel = $scope.cliPanel + formatOutput(data.prompt, data.cmd, data.output);
								cliPanelContents.push(formatOutput(data.prompt, data.cmd, data.output))
							}
						}
					})
				}
			}
		}
	])
	.controller('userInfoPopoverCtrl', ['$scope', 
		function($scope) {
			$scope.popover = {
				'title': 'User Info',
				'content': 'Hello World!'
			};
			$scope.setUser = function(node) {
				console.log(node)
				$scope.user = node.ownerObj;
			}
		}
	])
	.controller('sshLinkCtrl', ['$scope', '$aside', '$filter', 'Ping', 'mySocket', 'usSpinnerService', 'mySharedService',
		function($scope, $aside, $filter, Ping, mySocket, usSpinnerService, mySharedService) {
			$scope.reverse = false;
			var orderBy = $filter('orderBy');
			$scope.order = function(predicate) {
		    	$scope.labParts = orderBy($scope.labParts, predicate, $scope.reverse);
		    	$scope.currentOrder = predicate;
		    	$scope.reverse = !$scope.reverse;
		    };

		    $scope.isActive = function(order) {
		    	return order === $scope.currentOrder;
		    }

			$scope.setSpinnerKey = function(node) {
				var sk = node.ip.replace(/\./g, '-');
				$scope.spinnerKey = 'spinner-'+sk;
			};
			$scope.showSSH = function(node, filter) {
				if (node.owner && ($scope.user.csl != node.owner) && (filter != 'free') ) {
					return false;
				} else {
					return true;
				}
			};
			$scope.skipPing = function() {
				Ping.skipPing().success(function(data) {
					console.log(data)
					$scope.labParts = data;
					$scope.order('owner');
				});
			}
			$scope.pingAllNodes = function() {
				Ping.pingAllNodes().success(function(data) {
					console.log(data)
				});
			};
			$scope.pingNode = function(node) {
				$scope.spinning = true;
				usSpinnerService.spin($scope.spinnerKey);

				Ping.get(node)
					.success(function(data) {
						usSpinnerService.stop($scope.spinnerKey);
						$scope.spinning = false;
						console.log(data)
						if (data == 'false') {
							$scope.progress = '';
						} else {
							mySharedService.prepForBroadcast('refreshNodeList');
						}
					});
			};
			$scope.cliCommand = {};
			$scope.cliPanel = '';
			var cliPanelContents = [];
			$scope.connectNode = function(node)	{
				// console.log('>>>>>> '+JSON.stringify(node));
				// console.log($scope.user);
				var socketSuffix = ($scope.user.authenticated) ? $scope.user.login : null;
				if (socketSuffix) {
					mySocket.forward(socketSuffix);
					mySocket.emit('conn_node', {node: node, uid: socketSuffix});

					var formatOutput = function(prompt, cmd, output) {
						return prompt + ' ' + output + '\n';
					}

					$scope.sendCommand = function(cli) {
						console.log($scope.cliCommand.text)
						console.log(cli)
						mySocket.emit('sendchat', {cmd: cli, uid: socketSuffix});
						$scope.cliCommand.text = '';
					}

					$scope.$on('socket:'+socketSuffix, function(event, data) {
						if (data.init) {
							mySocket.emit('sendchat', {cmd: 'env no more', uid: socketSuffix});
						} else {
							if (cliPanelContents.indexOf(formatOutput(data.prompt, data.cmd, data.output)) < 0) {
								$scope.cliPanel = $scope.cliPanel + formatOutput(data.prompt, data.cmd, data.output);
								cliPanelContents.push(formatOutput(data.prompt, data.cmd, data.output))
							}
						}
					})
				}
			}
			$scope.tooltip = {
				'ssh': 'Click to SSH to the node',
				'ping': 'Click to ping the node'
			};
		}
	])
	.controller('helpCtrl', ['$scope', 
		function($scope) {
			$scope.tooltip = {
				'signup': 'Click to sign up'
			}
		}
	])
	.controller('labMapCtrl', ['$scope', '$q', 'Load', '$http', '$routeParams', 'mySharedService', 'mySocket',
		function($scope, $q, Load, $http, $routeParams, mySharedService, mySocket) {
			var filter = 'all';

			$scope.loadNodeList = function() {
				var loadUser = function() {
					var deferred = $q.defer();
					setTimeout(function() {
						deferred.resolve($scope.user)
					}, 50);
					return deferred.promise;
				}
				
				loadUser()
					.then(function(result) {
						if(typeof($scope.user) == 'string') {
							$scope.user = 'empty';
						}
						Load.get(filter, $scope.user, JSON.stringify({'position.row': 1, 'position.rack' : 1, 'position.pos': 1}))
							.success(function(data) {
								$scope.filter = filter;
								$scope.d3Data = data;

								var numberOfRows = function(data) {
									var rows = 1;
									data.forEach(function(rec) {
										if (rec.position.row > rows) {
											rows = rec.position.row;
										}
									});

									return parseInt(rows);
								};

								var numberOfRacksInRow = function(data, row) {
									var racks = 1;
									data.forEach(function(rec) {
										if (rec.position.row == row) {
											if (rec.position.rack > racks) {
												racks = rec.position.rack;
											}
										}
									});
									return parseInt(racks);
								};

								$scope.getRackInRow = function(arg) {
									return numberOfRacksInRow(data, arg);
								}
							
								if(data != 'null') {
									$scope.rows = numberOfRows(data);
								} else {
									console.log('what')
								}
								
								$scope.getNumber = function(num) {
									return new Array(num);
								}
							})
							.error(function(data) {
								console.log("ERROR : " + data);
							});
					})
			}

			$scope.$on('handleBroadcast', function() {
				console.log('reloading!!!!!!!')
				if (mySharedService.message == 'refreshNodeList') {
					$scope.loadNodeList();
				}
			});

			$scope.$on('socket:broadcast', function(event, data) {
				if (data.msg == 'loadNodes') {
					$scope.loadNodeList();
				}
			})

			$scope.loadNodeList();
		}
	])
	.controller('helpCtrl', ['$scope', 
		function($scope) {
			$scope.tooltip = {
				'signup': 'Click to sign up'
			}
		}
	])
	.controller('searchEngine', ['$scope','Search', 'usSpinnerService', 'flash', function($scope, Search, usSpinnerService, flash) {
		// $scope.Vun = function(inputSearch) {
		// 	var json = '{"entryRec":[';
		// 	var arr = [];
		// 	var temp = " ";
		// 	Search.addVun(inputSearch).success(function(data) {
		// 		if (/Invalid\sentry/.test(data)) alert(data);
		// 		arr = data;

		// 		for(var i = 0; i < arr.length; i++){
		// 			if (i == arr.length - 1) {
		// 				temp = '{"sysType":"' + /\s\d{4}\s\w+/.exec(arr[i]) + '","sysVersion":"' + /\d+\.\d\.\D\d+/.exec(arr[i]) + '","cardType":"' + /\s[a-zA-z]\w+-\w+\/?\+?\w+-\w+-\w+\+?|[a-zA-z]\w+-\w+\/?\+?\w+-\w+|[a-zA-Z]\w+-\w+|[a-zA-Z]\w+-\w+\/?\+?\w+-\w+-\w+-\w+\+?|Fan|Power\sModule|Chassis|\sCCM|\s#[A-Z]{3}[1-9]?|[a-z]{2,}\d+/.exec(arr[i]) + '","mgmtIP":"' + /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.exec(arr[i]) + '","SN":"' + /[Nn][Ss]\w+/.exec(arr[i]) + '","partNum":"' + /3[Hh][Ee]\w+/.exec(arr[i]) + '","Slot":"' + /\s\d{1,2}\/\d{1,2}\/\d{1,2}|\s\d{1,2}\/\d|\s\d{1,2}\s|\sA\s|\sB\s/.exec(arr[i]) + '","State":"' + /\s[a-z]+\sup|\s[a-z]+\sprovisioned|\s[a-z]+\sunprovisioned|\s[a-z]+\sdown|\s[a-z]+\sfailed/.exec(arr[i]) + '","ownerInfo":"' + /\d\d\d\d-\d\d-\d\d\s\w+\s\w+\s\d\d\d\d-\d\d-\d\d|Free/.exec(arr[i]) + '" }]}';
		// 				json = json + temp;
		// 			} else {
		// 				temp = '{"sysType":"' + /\s\d{4}\s\w+/.exec(arr[i]) + '","sysVersion":"' + /\d+\.\d\.\D\d+/.exec(arr[i]) + '","cardType":"' + /[a-zA-z]\w+-\w+\/?\+?\w+-\w+-\w+\+?|[a-zA-z]\w+-\w+\/?\+?\w+-\w+|[a-zA-Z]\w+-\w+|[a-zA-Z]\w+-\w+\/?\+?\w+-\w+-\w+-\w+\+?|Fan|Power\sModule|Chassis|\sCCM|\s#[A-Z]{3}[1-9]?|[a-z]{2,}\d+/.exec(arr[i]) + '","mgmtIP":"' + /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.exec(arr[i]) + '","SN":"' + /[Nn][Ss]\w+/.exec(arr[i]) + '","partNum":"' + /3[Hh][Ee]\w+/.exec(arr[i]) + '","Slot":"' + /\s\d{1,2}\/\d{1,2}\/\d{1,2}|\s\d{1,2}\/\d|\s\d{1,2}\s|\sA\s|\sB\s/.exec(arr[i]) + '","State":"' + /\s[a-z]+\sup|\s[a-z]+\sprovisioned|\s[a-z]+\sunprovisioned|\s[a-z]+\sdown|\s[a-z]+\sfailed/.exec(arr[i]) + '","ownerInfo":"' + /\d\d\d\d-\d\d-\d\d\s\w+\s\w+\s\d\d\d\d-\d\d-\d\d|Free/.exec(arr[i]) + '" },';
		// 				json = json + temp;
		// 			}
		// 		}
		// 		var str = json.replace(/null/g, ' -- ');
		// 		var obj = JSON.parse(str);
		// 		$scope.Restify = obj.entryRec;
		// 	}).error(function(data){
		// 		alert(data);
		// 	});
		// }
	    $scope.startSpin = function(){
	        usSpinnerService.spin('spinner-1');
	    }

	    $scope.stopSpin = function(){
	        usSpinnerService.stop('spinner-1');
	    }
		$scope.Vun = function(inputSearch) {
			var json = '{"entryRec":[';
			var invalid_entry_message = "You have entered an Invalid entry.  For system type or version, enter complete value. (e.g.. 7750 SR12, 13.0.R5).  For part number and serial number, enter at least one digit that follows NS or 3HE.";
			var arr = [];
			var temp = " ";
			var res_owner = " ";

			Search.addVun(inputSearch).success(function(data) {
				if (/Invalid\sentry/.test(data) || !data.length) {
					flash.error = invalid_entry_message;
					$scope.stopSpin();
				} else {
					arr = data;
					for (var i = 0; i < arr.length; i++) {
						var owner = /\d\d\d\d-\d\d-\d\d\s\w+\s\w+\s\d\d\d\d-\d\d-\d\d|Free/.exec(arr[i]);
						res_owner = owner;
						if (/Free/.test(owner)) {
							// do nothing
						} else {
							res_owner = /\s\w+\s\w+\s/.exec(owner);
						}

						if (i == arr.length - 1) {
							temp = '{"sysType":"' + /\s\d{4}\s\w+/.exec(arr[i]) + '","sysVersion":"' + /\d+\.\d\.\D\d+/.exec(arr[i]) + '","cardType":"' + /\s[a-zA-z]\w+-\w+\/?\+?\w+-\w+-\w+\+?|[a-zA-z]\w+-\w+\/?\+?\w+-\w+|[a-zA-Z]\w+-\w+|[a-zA-Z]\w+-\w+\/?\+?\w+-\w+-\w+-\w+\+?|Fan|Power\sModule|Chassis|\sCCM|\s#[A-Z]{3}[1-9]?|[a-z]{2,}\d+/.exec(arr[i]) + '","mgmtIP":"' + /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.exec(arr[i]) + '","SN":"' + /[Nn][Ss]\w+/.exec(arr[i]) + '","partNum":"' + /3[Hh][Ee]\w+/.exec(arr[i]) + '","Slot":"' + /\s\d{1,2}\/\d{1,2}\/\d{1,2}|\s\d{1,2}\/\d|\s\d{1,2}\s|\sA\s|\sB\s/.exec(arr[i]) + '","State":"' + /\s[a-z]+\sup|\s[a-z]+\sprovisioned|\s[a-z]+\sunprovisioned|\s[a-z]+\sdown|\s[a-z]+\sfailed/.exec(arr[i]) + '","ownerInfo":"' + res_owner + '" }]}';
							json = json + temp;
						} else {
							temp = '{"sysType":"' + /\s\d{4}\s\w+/.exec(arr[i]) + '","sysVersion":"' + /\d+\.\d\.\D\d+/.exec(arr[i]) + '","cardType":"' + /[a-zA-z]\w+-\w+\/?\+?\w+-\w+-\w+\+?|[a-zA-z]\w+-\w+\/?\+?\w+-\w+|[a-zA-Z]\w+-\w+|[a-zA-Z]\w+-\w+\/?\+?\w+-\w+-\w+-\w+\+?|Fan|Power\sModule|Chassis|\sCCM|\s#[A-Z]{3}[1-9]?|[a-z]{2,}\d+/.exec(arr[i]) + '","mgmtIP":"' + /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.exec(arr[i]) + '","SN":"' + /[Nn][Ss]\w+/.exec(arr[i]) + '","partNum":"' + /3[Hh][Ee]\w+/.exec(arr[i]) + '","Slot":"' + /\s\d{1,2}\/\d{1,2}\/\d{1,2}|\s\d{1,2}\/\d|\s\d{1,2}\s|\sA\s|\sB\s/.exec(arr[i]) + '","State":"' + /\s[a-z]+\sup|\s[a-z]+\sprovisioned|\s[a-z]+\sunprovisioned|\s[a-z]+\sdown|\s[a-z]+\sfailed/.exec(arr[i]) + '","ownerInfo":"' + res_owner + '" },';
							json = json + temp;
						}
					}
					var str = json.replace(/null/g, ' -- ');
					var obj = JSON.parse(str);
					$scope.Restify = obj.entryRec;
					console.log($scope.Restify);
					$scope.stopSpin();
				}
			}).error(function(data) {
				alert(data);
			});
		}
	}])
	.controller('dateUpdate', ['$scope','streamDate', function($scope, streamDate) {
		streamDate.getDate().success(function(data) {
			$scope.Date = data;
		});
	}])