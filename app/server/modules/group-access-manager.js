var	groupsdb 	= require('./model').groups(),
	i 			= require('./assets'),
	async 		= require('async'),
	fs 			= require('fs'),
	_ 			= require('underscore');

module.exports = function() {

        this.loadGroups = function(user, res) {       
            console.log("company: ", user.properties.company.value);
            console.log("group: ", Object.keys(user.permissions)[1]);
            
            if(user.properties.company.value === 'ALU' || Object.keys(user.permissions)[1] === 'TEC') {
                 groupsdb.find({
                    $and : [
                         { company : 'ALU' }, 
                         { group : {$exists : true}}
                    ]}, function(err, cursor) {  
                    if (err) { console.log('ERRROROROROROROR') }
                    else {
                        cursor.toArray(function(err, rec) {
                            if(err) {
                                console.log('you got be kidding me.');
                            } else {
                                console.log(rec);
                                res.json(rec);
                            }
                        })
                    }
                });               
            }
        }
}