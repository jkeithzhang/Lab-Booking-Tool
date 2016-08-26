var exec 		= require('child_process').exec;

module.exports = function() {

	this.authenticate = function(csl, cip, res) {
		exec('curl -k -v https://138.120.243.17:443/api.php/auth/'+csl+'/'+encodeURIComponent(cip), function(err, stdout, stderr) { 
			res.json(stdout); 
		});
	}

	this.verify = function(csl, email, res) {
		console.log('curl -k -v https://138.120.243.17:443/api.php/verify/'+csl+'/'+encodeURIComponent(email));
		exec('curl -k -v https://138.120.243.17:443/api.php/verify/'+csl+'/'+encodeURIComponent(email), function(err, stdout, stderr) { 
			res.json(stdout); 
		});
	}

}
