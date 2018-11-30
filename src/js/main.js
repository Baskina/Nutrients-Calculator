$(function() {

	let buttons = $(".tabs li");
	let currentelem = $($(".active a").attr('href'));;

	toggleTab();

	function toggleTab() {
		buttons.each(function(){
			let tab_id = $($(this.innerHTML).attr('href'));
			tab_id.css("display", "none");
		});
		currentelem.css("display", "block");
	}

	buttons.on("click", function(event){
		let target = $(this);
		let targetLink = $(target.html());

		if(!(target.hasClass("active"))){
			buttons.removeClass("active");
			target.addClass("active");

			currentelem.css("display", "none");
			currentelem = $($(".active a").attr('href'));
			currentelem.css("display", "block");
		}
	});
});