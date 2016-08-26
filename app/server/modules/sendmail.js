var exec = require('child_process').exec;

function execute(cmd, callback) {
	exec(cmd, function(err, stdout, stderr) { 
		callback (stdout); 
	});
};

module.exports = function() {
	this.sendMail = function(sender, to, subject, msg, callback) {
		var pl_file = __dirname + '/../library/sendmail.php';
		execute("/usr/bin/php " + pl_file + ' "' + sender + '" "' + to + '"  "' + msg + '" "' + subject + '"', callback);
	}
}