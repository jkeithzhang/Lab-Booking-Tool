angular.module('bookingApp')
	.config(['flashProvider',
		function(flashProvider) {
			flashProvider.successClassnames.push('alert-success');
			flashProvider.infoClassnames.push('alert-info');
			flashProvider.warnClassnames.push('alert-warning');
			flashProvider.errorClassnames.push('alert-danger');
		}
	])
	.config(['$routeProvider', 
		function($routeProvider) {
			$routeProvider
				.when('/login', {
					templateUrl: '../partials/login', 
					login: true	
				})
				.when('/signup', {
					templateUrl: '../partials/signup', 
					public: true	
				})
				.when('/search', {
					templateUrl: '../partials/search',
					controller: 'dateUpdate',
					public: true
				})
				.when('/ofpp', {
					templateUrl: '../partials/ofpp',
					controller: 'getNodeList',
					login: true
				})
				.when('/loadNodes/:filter', {
					templateUrl: '../partials/loadNode',
					controller: 'loadNode',
					public: true
				})
				.when('/labMap/:filter', {
					templateUrl: '../partials/labMap',
					controller: 'labMapCtrl',
					public: true
				})
				.otherwise({ redirectTo: '/loadNodes/free'});
		}
	])
	.config(['ngQuickDateDefaultsProvider', 
		function(ngQuickDateDefaultsProvider) {
			return ngQuickDateDefaultsProvider.set({
				closeButtonHtml: "<i class='pe-7s-close pe-2x pe-va'></i>",
			    buttonIconHtml: "",
			    nextLinkHtml: "<i class='pe-7s-angle-right pe-2x pe-va'></i>",
			    prevLinkHtml: "<i class='pe-7s-angle-left pe-2x pe-va'></i>",
			    // Take advantage of Sugar.js date parsing
			    parseDateFunction: function(str) {
			      	d = Date.create(str);
			      	return d.isValid() ? d : null;
			    }
			})
		}
	])
	.run(function(user) {
		user.onAuthenticationSuccess(function() {
			// hide popup, transition
			history.back();
		});
		user.init({ appId: '53975ae892d2f' });
		user.onAuthenticationSuccess(function() {
			// hide popup, transition
			history.back();
		});
	});