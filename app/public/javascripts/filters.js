var bookingFilter = angular.module('bookingFilter', []);



bookingFilter
	.filter('capitalize', 
		function() {
 			return function(input, scope) {
 				if (input!=null)
 					input = input.toLowerCase();
 				return input.substring(0,1).toUpperCase()+input.substring(1);
 			}
		})
	.filter('showSignature', 
		function() {
			return function(sigs, scope) {
				var level = 3;

				if(scope.user.hasPermission('tec')){
					level = 1;
				} 

				for (var comp in sigs) {
					var compName = sigs[comp].component;
					for(var tt in sigs[comp]) {
						for(var index in sigs[comp][tt]) {
							if (typeof(sigs[comp][tt][index]) == 'object') {
								var obj = sigs[comp][tt][index];
								if (parseInt(obj.signature.level) >= level) {
									return true;
								} else { 
									return false;
								}
							}
						}
					}
				}
			}
		});