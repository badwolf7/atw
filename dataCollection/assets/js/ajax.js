var public_key = 'bGbzn6QJJgTmWYz1r82d';
var private_key = 'VpmAXgWMM1UopdKYVyP1';
var delete_key = '5oz2eQgXX3fnVy57Lle1';

$.ajax({
	url: 'http://data.sparkfun.com/output/'+public_key+'.json',
	jsonp: 'callback',
	cache: true,
	dataType: 'jsonp',
	data: {
		page: 1
	},
	success: function(res){
		// response will be a js array of objects
		console.log(res);
		res.forEach(function(obj){
			var date = new Date(obj.timestamp);
			$('table tbody').append("<tr><td>"+obj.light+"</td><td>"+obj.temp_c+"</td><td>"+obj.temp_f+"</td><td>"+date+"</td></tr>");
		});
	}
});