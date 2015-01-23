window.onload = function(){
	$(function(){
		$("div.holder").jPages({
			containerID : "dataContainer"
		});
	});
	setTimeout(function(){
		$('.jp-previous').prepend("&larr; ");
		$('.jp-next').append(" &rarr;");
	},300);
}