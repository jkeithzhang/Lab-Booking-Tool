
angular.module('bookingService')
	.factory('_', function() {
		return window._;
	})
	.factory('mySharedService', ['$rootScope', 
		function($rootScope) {
			var sharedService = {};

		    sharedService.message = '';

		    sharedService.prepForBroadcast = function(msg) {
		        this.message = msg;
		        this.broadcastItem();
		    };

		    sharedService.broadcastItem = function() {
		    	console.log('broadcasting...')
		        $rootScope.$broadcast('handleBroadcast');
		    };

		    return sharedService;
		}
	])
	.factory('mySocket', function(socketFactory) {
		var socket = socketFactory();
		socket.forward('broadcast');
		return socket;
	})
	.factory('LDAP', ['$http', 
		function($http) {
			return {
				authenticate: function(csl, cip) {
					console.log('services received: ', csl);
					return $http({
						url: '/api/ldap',
						method: 'GET',
						params: {csl: csl, cip: cip}
					});
				}, 

				verify: function(csl, email) {
					return $http({
						url: '/api/signupLdap',
						method: 'GET',
						params: {csl: csl, email: email}
					});
				},

				//set the authenticated to 1
				login: function(csl) {
					return $http({
						url: '/api/login',
						method: 'GET',
						params: {csl: csl}
					});
				},

				//set the authenticated to 1
				signup: function(user) {
					return $http({
						url: '/api/signup',
						method: 'GET',
						params: {user: user}
					});
				},

				//log out
				logout: function(csl) {
					return $http({
						url: '/api/logout',
						method: 'GET',
						params: {csl: csl}
					});
				}						
			}
		}
	])
	.factory('Cookie', ['$http',
		function($http) {
			return {			
				ifexpire: function() {
					return $http({
						url: '/api/ifexpire',
						method: 'GET'
					});
				}
			}
		}
	])	
	.factory('Browser', ['$window', 
		function($window) {
			return {
				type: function() {
					var userAgent = $window.navigator.userAgent;
					var browsers = {chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /internet explorer/i};

			        for(var key in browsers) {
			            if (browsers[key].test(userAgent)) {
			                return key;
			            }
			       	};

			       	return 'unknown';
			    }
			}
		}
	]);