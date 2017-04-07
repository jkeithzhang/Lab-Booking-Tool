angular.module('bookingController')
	.controller('ldapCtrl', ['$scope', 'LDAP', 'flash', 'Cookie', '$rootScope',
		function($scope, LDAP, flash, Cookie, $rootScope) {

			$scope.auth = function() {				
					Cookie.ifexpire()
						.success(function(data) {
							if(data == 'expired') {
								$scope.user = false;											
							} else {
								$scope.user = data[0];
								console.log(">>>"+JSON.stringify($scope.user));
							}						
						})
						.error(function(data) {
							console.log("ERROR : " + data);
						})
			}

			//Log in
			$scope.authenticate = function() {
				console.log("------>", $scope.csl, "--->", $scope.cip);
				LDAP.authenticate($scope.csl, $scope.cip)
					.success(function(data) {
						console.log(data);
						var userObj = JSON.parse(data);
						if(userObj !== '0') {
							LDAP.login($scope.csl)
								.success(function(data) {
									flash.success = 'Log in successfully';									
									//move this part in API shortly
									console.log(',,,,,,', data);
									$scope.user = data[0];
									window.location.href = '/book';
								});		
					
						} else {
							flash.success = 'Invalid password or username!';	
						}
					})
			}

			//Sign up
			$scope.verify = function() {
				LDAP.verify($scope.csl, $scope.email)
					.success(function(data) {
						var userObj = JSON.parse(data);
						if(userObj !== '0') {
							var info = userObj.split('::');
							console.log(info)
							var fullname = info[1];
							var lastname = fullname.split(' ')[0];
							var firstname = fullname.split(' ')[1];
							var phone = info[5];
							var country = info[3];
							var location = info[4];							
							var user = {
								firstname 	: firstname,
								lastname 	: lastname,
								country     : country,
								location    : location,
								phone 		: phone,							
								email 		: $scope.email,
								csl 		: $scope.csl
							};
							console.log(user)
							LDAP.signup(user)
								.success(function(data) {
									if (data.type == 'warning') flash.error = data.msg;
									if (data.type == 'success') flash.success = data.msg;
								});							
						} else {
							flash.success = 'Something weird happened, please try again!';	
						}
					})
			}

			//Log out
			$scope.logout = function() {
				LDAP.logout($scope.user.csl)
					.success(function(data) {
						console.log('log out successfully');
						$scope.user = {};
						setTimeout(function() {
							window.location.reload();
						}, 100);					
					})
			}

		}
	])	
	.controller('browserCtrl', ['$scope', 'Browser', '$location',
		function($scope, Browser, $location) {
			$scope.host = $location.host();
			var type = Browser.type();
			if (type == 'firefox' || type == 'internet explorer' || type == 'unknown') {
				$scope.showlink = true;
			} else {
				$scope.showlink = false;
			}
		}
	])
	.controller('viewCtrl', ['$scope', '$location',
		function($scope, $location) {

			if($location.path() == '/login' || $location.path() == '/signup') {
				$scope.hideScroll = 'hideScroll';
			} else {
				$scope.hideScroll = '';
			}
		}
	])
	.controller('navCtrl', ['$scope', '$location',
		function($scope, $location) {
			$scope.isActive = function(route) {
				$scope.updateSubNavClass();
				return route === $location.path();
			}
			$scope.updateSubNavClass = function() {
				var res = $location.path().match(/\/loadNodes\/(\S+)/)
				if (res) {
					$scope.subNavClass = res[1];
				}

				var res = $location.path().match(/\/labMap\/(\S+)/)
				if (res) {
					$scope.subNavClass = res[1];
				}

				var res = $location.path().match(/\/parts/)
				if (res) {
					$scope.subNavClass = 'parts';
				}
			}
			$scope.updateSubNavClass();
		}
	])
	.controller('helpCtrl', ['$scope', 
		function($scope) {
			$scope.tooltip = {
				'signup': 'Click to sign up'
			}
		}
	])
	.controller('modalCtrl', ['$scope', 'mySharedService', 'mySocket',
		function($scope, mySharedService, mySocket) {
			$scope.setNode = function(node) {
				$scope.node = node;
			};
			$scope.setSig = function(sig) {
				console.log(sig)
				$scope.sig = sig;
			};
			//here
			$scope.setCard = function(node) {
				console.log("sequence issue: ", node);
				var fin = {};
				for(card in node.cards) {
					if(node.cards[card].slot.search("/") == -1) {
						if(typeof(fin[node.cards[card].slot]) == 'undefined')
							fin[node.cards[card].slot] = {};
						if(typeof(fin[node.cards[card].slot]['IOM']) == 'undefined')
							fin[node.cards[card].slot]['IOM'] = [];
						fin[node.cards[card].slot]['IOM'].push(node.cards[card]);
					} else {
						var temp = node.cards[card].slot.split("/");
						if(typeof(fin[temp[0]]) == 'undefined'){
							fin[temp[0]] = {};
						}
						if(typeof(fin[temp[0]]['MDA']) == 'undefined'){
							fin[temp[0]]['MDA'] = [];							
						}
						fin[temp[0]]['MDA'].push(node.cards[card]);
					}
				}
				$scope.cards = fin;
				console.log("---->", $scope.cards)
			};
			$scope.connectNode = function(node)	{
				console.log('.......connect');
				var socketSuffix = ($scope.user.authenticated) ? $scope.user.login : null;
				if (socketSuffix) {
					mySocket.forward(socketSuffix);
					mySocket.emit('conn_node', {node: node, uid: socketSuffix});
				}
			}
			$scope.setNodeForUser = function(node, user) {
				$scope.node = node;
				$scope.ipClass = ($scope.node.status == 'live') ? 'label-success' : 'label-default'; 
				$scope.startDate = new Date();
				$scope.endDate = $scope.node.end ? new Date(Date.parse($scope.node.end)) : null;
				if (node.hasOwnProperty('owner')) {
					$scope.owner = ($scope.node.owner == user) ? 'me' : $scope.node.owner;
				}
			}
			$scope.nodeIsMine = function(node) {
				if (node.hasOwnProperty('owner')) {
					if (node.owner == $scope.user.csl) {
						return true;
					}
				}
				return false;
			}
			if ($scope.node) {
				$scope.ipClass = ($scope.node.status == 'live') ? 'label-success' : 'label-default'; 
				$scope.owner = ($scope.node.owner == $scope.user.csl) ? 'me' : $scope.node.owner;
				$scope.startDate = new Date();
				$scope.endDate = $scope.node.end ? new Date(Date.parse($scope.node.end)) : null;
			}
			
		}
	]);
	
