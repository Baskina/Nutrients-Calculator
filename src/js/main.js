$(function() {

	let currentelem = $(".active a").attr('href');
	let tabObjects = {};
	let standartWeight = 100;

	class TabObject {
		constructor(id) {
			this.id = id;
			this.weightOldArray = [];
		}

		addProduct(object) {
			let div = "<div/>";
			$(div, {class: 'row product'})
			.appendTo($(this.id))
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
		}

		addWeightOld() {
			this.weightOldArray.push(standartWeight);
		}

		calculateNutrients() {
			let sumArray = $(this.id).children('.sum').children('div');
			let productRowsArray = $(this.id).children('.product');

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

						nutrientWithWeight = +($($(elemProd).children('div')[indexSum]).html() / this.weightOldArray[indexProd] * weight).toFixed(6);
						$($(elemProd).children('div')[indexSum]).html(nutrientWithWeight);
						
						sum += nutrientWithWeight;

						if(indexSum == 0) {
							sumWeight += weight;
						}

						if(indexSum == sumArray.length - 3) {
							this.weightOldArray[indexProd] = weight;
						}

					}.bind(tabObjects[currentelem]));

					$(elemSum).html(sum.toFixed(2));

					if(indexSum == 0) {
						$(sumArray[sumArray.length - 2]).children('input').val(sumWeight);
					}
				}
			});
		}
	}

	let buttons = $(".tabs li");

	toggleTab();

	function toggleTab() {
		buttons.each(function(){
			let tab_id = $(this.innerHTML).attr('href');
			tabObjects[tab_id] = new TabObject(tab_id);
			$(tab_id).css("display", "none");
		});
		$(currentelem).css("display", "block");
	}

	buttons.on("click", function(event){
		let target = $(this);
		let targetLink = $(target.html());

		if(!(target.hasClass("active"))){
			buttons.removeClass("active");
			target.addClass("active");

			$(currentelem).css("display", "none");
			currentelem = $(".active a").attr('href');
			$(currentelem).css("display", "block");
		}
	});

	
	let sumProdKcal = 0;
	let targetBMR = 0;
	let recommendation;


	fetch("http://localhost:8080/db/db_product.json")
	.then(
		(response) => response.json(),
		(error) => {console.log(error)}
		)
	.then(function(mainProductBase) {
		$('.add-btn').on("click", function(event) {

			let userProductStr = $(`${currentelem} #name-product`)
			.val()
			.toUpperCase();

			if(userProductStr != "") {
				let findObj = mainProductBase.find(x => x["Shrt_Desc"].indexOf(userProductStr) != -1);
				if(findObj == undefined) alert('этого продукта нет в нашей базе, увы');
				else {

					tabObjects[currentelem].addProduct(findObj);
					tabObjects[currentelem].addWeightOld();

					$('input.weight')
					.on('input', function() {

						tabObjects[currentelem].calculateNutrients();

						sumProdKcal = sumKcal();
						$("#main-sum-kcal span").html(sumProdKcal.toFixed(2));
						recommendation = totalResult();
						$("#recommendation").html(recommendation);
					})
					.on('click', function() {
						$(this).select();
					});

					

					tabObjects[currentelem].calculateNutrients();

					sumProdKcal = sumKcal();
					$("#main-sum-kcal span").html(sumProdKcal.toFixed(2));
					recommendation = totalResult();
					$("#recommendation").html(recommendation);
				}
			}
		});
	});

	function sumKcal() {
		let mainSumKcal = 0;

		$(".sum-kcal").each(function(index, elem) {
			mainSumKcal += +$(elem).html();
		});

		return mainSumKcal;
	}

	$("form").on('submit', function(event) {
		event.preventDefault();

		let errorCount = 0;
		$(".error-message").remove();

		$("form select").each(function(index, elem) {
			$(elem).removeClass("novalid");

			if($(elem).val() == null) {
				$(elem).addClass("novalid");

				if(!errorCount)	{
					$(elem).parents(".form-inner").append($('<div>', {
						class: 'error-message', 
						width: '100%'
					}));
					$(".error-message").html("некорректно введенные данные");
				}

				errorCount++;
			}
		});

		$("form input").each(function(index, elem) {
			$(elem).removeClass("novalid");

			if(!$(elem).val().match(/^\d+$/)) {
				$(elem).val("некорректно введенные данные").addClass("novalid");

				if(!errorCount)	{
					$(elem).parents(".form-inner").append($('<div>', {
						class: 'error-message', 
						width: '100%'
					}));
					$(".error-message").html("некорректно введенные данные");
				}

				errorCount++;
			}
		})
		.on('click', function() {
			$(this).select();
		});

		if(!errorCount) {
			let weight = $("#weight").val();
			let height = $("#height").val();
			let age = $("#age").val();
			let sex = +$("#sex").val();
			let sport = $("#sport").val();
			let target = +$("#target").val();

			let BMR = formulaMyflinZhor(weight, height, age, sex);
			let kABMR = sport * BMR;
			targetBMR = kABMR + target * kABMR;

			$("#target-kcal span").html(targetBMR.toFixed(2));

			let unitProportion = targetBMR / 6;
			let protein = lipid = unitProportion;
			let carbohydrt = unitProportion * 4;

			let normalArray = $(".normal div");
			$(normalArray[0]).html(protein.toFixed(2));
			$(normalArray[1]).html(lipid.toFixed(2));
			$(normalArray[2]).html(carbohydrt.toFixed(2));
			
			recommendation = totalResult();
			$("#recommendation").html(recommendation);
		}
	});

	function formulaMyflinZhor (weight, height, age, sex) {
		return 9.99 * weight + 6.25 * height - 4.92 * age + sex;
	}

	function totalResult() {
		let inequality = sumProdKcal - targetBMR;

		switch (true) {
			case ((inequality >= -100) && (inequality <= 100)):
			recommendation = "great job";
			break;
			case (inequality < -100):
			recommendation = "eat more";
			break;
			case (inequality > 100):
			recommendation = "oops! too match. let's try tomorrow";
			break;
		}

		return recommendation;
	}
});