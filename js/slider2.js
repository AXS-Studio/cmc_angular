// Query UI Slider functions only
 $(function() {

 	var el = $('input[name=slider]');
	var scope = angular.element(el[0]).scope();

	$( "#slider" ).slider({
		min: 0,
		max: 100,
		width: 250,
		step: 1,
		//value: 50,
		animate: "fast",
		create: function (event, ui){
			console.log("create called");

			if (scope.thisQuestion.answer!=null)
				$(this).slider('value', scope.thisQuestion.answer);
				//$(this).slider('value', 100);
			else {
				$('.ui-slider-handle').hide();
			}
		},
		change: function(event, ui) {

			console.log("change called");

			if (event.originalEvent) {
				console.log("original event");
			}

			$('.ui-slider-handle').show();
					
			scope.$apply(function() {
				scope.sliderChanged = true;
				scope.thisQuestion.answer = ui.value;
			});
		},
		refresh: function(){
			console.log("refresh called");
		}
	});

 });

//console.log("inside slider: " + scope.thisQuestion.answer);