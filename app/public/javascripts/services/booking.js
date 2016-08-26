angular.module('bookingService')
	.factory('Scan', ['$http',
		function($http) {
			return {
				get: function() {
					return $http.get('/api/nodeList');
				}
			}
		}
	])
	.factory('Ping', ['$http', 
		function($http) {
			return {
				get: function(node) {
					return $http({
						url: '/api/pingNode',
						method: 'GET',
						params: {node: node}
					});
				},
				pingAllNodes: function() {
					return $http({
						url: '/api/pingAllNodes',
						method: 'GET'
					});
				}, 
				skipPing: function() {
					return $http({
						url: '/api/skipPing',
						method: 'GET'
					});
				}
			};
		}
	])
	.factory('PCRE', ['$http', 
		function($http) {
			return {
				regexTest: function(regex, context, rel, sid, tid) {
					return $http({
						url: '/api/regexText',
						method: 'GET',
						params: {regex: regex, context: context, release: rel, sid: sid, tid: tid}
					});
				}
			};
		}
	])
	.factory('Load', ['$http',
		function($http) {
			return {
				get: function(filter, me, sort) {
					return $http({
						url: '/api/loadNodes', 
						method: 'GET',
						params: {filter: filter, me: me, sort: sort}
					});
				},
				
				getType: function() {
					return $http({
						url: '/api/loadTypes/',
						method: 'GET'
					});
				},

				getNodeLog: function(ip) {
					return $http({
						url: '/api/getNodeLog',
						method: 'GET',
						params: {ip: ip}
					});
				},

				getAllNodeLogRegistry: function() {
					return $http({
						url: '/api/getAllNodeLogRegistry',
						method: 'GET'
					});
				}

			}
		}
	])
	.factory('Book', ['$http',
		function($http) {
			return {
				post: function(node, owner, type, options) {
					console.log('>>>>>>>>>>>>>>>>', options);
					if (type == 'book') {
						return $http({
							url: '/api/bookNode',
							method: 'POST',
							params: {node: node, owner: owner, options: options}
						});
					} else if (type == 'release') {
						return $http({
							url: '/api/releaseNode',
							method: 'POST',
							params: {node: node, options: options}
						});
					}
				},

				update: function(node) {
					return $http({
						url: '/api/updateNode',
						method: 'POST',
						params: {node: node}
					});
				},
				add: function(node) {
					return $http({
						url: '/api/addNode',
						method: 'POST',
						params: {node: node}
					});
				},
				remove: function(node) {
					return $http({
						url: '/api/removeNode',
						method: 'POST',
						params: {node: node}
					});
				}
			}
		}
	])
	.factory('Search', ['$http',
		function($http) {
			return {
				addVun: function(input) {
					return $http({
						url: '/api/searchEngine',
						method:'POST',
						params: {input: input}
					});
				}
			}
		}
	])
	.factory('streamDate' , ['$http',
		function($http) {
			return {
				getDate: function() {
					return $http({
						url: '/api/searchUpdate',
						method: 'POST'
					});
				}
			}
		}
	])