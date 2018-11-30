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

	let activeTag;
	let count;
	let weightArrayOld = [];
	let standartWeight = 100;

	checkout();

	function checkout() {
		fetch("http://localhost:8080/db/db_product.json")
		.then(
			(response) => response.json(),
			(error) => {console.log(error)}
			)
		.then(function(mainProductBase) {
			$('.add-btn').on("click", function(event) {
				activeTag = '#' + ($(event.target).parents(".tabs-item").attr("id"));
				let userProductStr = $(`${activeTag} #name-product`)
				.val()
				.toUpperCase();

				if(userProductStr != "") {
					let findObj = mainProductBase.find(x => x["Shrt_Desc"].indexOf(userProductStr) != -1);
					if(findObj == undefined) alert('этого продукта нет в нашей базе, увы');
					else {
						addProduct(findObj, activeTag);

						weightArrayOld = [];
						count = 0;
						calculateNutrients.call($(activeTag));
						count++;
						$("#main-sum-kcal span").html(sumKcal());
					}
				}
			});
		});
	};

	function addProduct(object, container) {
		let div = "<div/>";
		$(div, {class: 'row product'})
		.appendTo(container)
		.append($(div).html(object["Protein_(g)"]))
		.append($(div).html(object["Lipid_Tot_(g)"]))
		.append($(div).html(object["Carbohydrt_(g)"]))
		.append($(div).html(object["Energ_Kcal"]))
		.append($(div).append($('<input>', {
			type: 'text',
			name: 'weight',
			class: 'weight',
			value: '100'
		})))
		.append($(div).html(object["Shrt_Desc"]));

		$('input.weight')
		.on('input', function() {
			calculateNutrients.call($(activeTag));
		})
		.on('click', function() {
			$(this).select();
		});
	}

	function sumKcal() {
		let mainSumKcal = 0;

		$(".sum-kcal").each(function(index, elem) {
			mainSumKcal += +$(elem).html();
		});

		return mainSumKcal;
	}

	function calculateNutrients() {
		let sumArray = $(this).children('.sum').children('div');
		let productRowsArray = $(this).children('.product');

		sumArray.each(function(indexSum, elemSum) {
			let sum = 0;
			let weight = 0;
			let sumWeight = 0;
			let nutrientWithWeight = 0;

			if(indexSum < sumArray.length - 2) {
				productRowsArray.each(function(indexProd, elemProd) {
					
					weight = $($(elemProd).children('div')[sumArray.length - 2]).children('input').val();
					
					if((weight == 0) || !(weight.match(/^\d+$/))) {
						weight = standartWeight;
						$($(elemProd).children('div')[sumArray.length - 2]).children('input').val(standartWeight);
					}
					if((count == 0) && (indexSum == 0)) {
						weightArrayOld.push(standartWeight);
					}
					
					nutrientWithWeight = +($($(elemProd).children('div')[indexSum]).html() / weightArrayOld[indexProd] * weight);
					$($(elemProd).children('div')[indexSum]).html(nutrientWithWeight);
					sum += nutrientWithWeight;
					
					if(indexSum == 0) {
						sumWeight += weight;
					}
					if(indexSum == sumArray.length - 3) {
						weightArrayOld[indexProd] = weight;
					}
				});

				$(elemSum).html(sum);
				if(indexSum == 0) {
					$(sumArray[sumArray.length - 2]).children('input').val(sumWeight);
				}
			}
		});
	}
});