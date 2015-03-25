<!-- Survey questions template for ng-include in survey.php -->
<!-- Shows Multiple Choice (MC) or slider (VAS) depending on question type -->
<div class="container-fluid col-xs-8 col-md-6 col-lg-6 center-block" style="float: none;">

		<div>{{thisQuestion.questionInstruction}}</div>
		<div>{{thisQuestion.question.stem}}</div>

		<!-- Multiple choices -->
		<div id="MCcontainer" class="btn-group-vertical text-center" data-toggle="buttons" ng-show="thisQuestion.questionType=='MC'">
		<!-- Use ng-repeat to dynamically generate radio buttons. Populates ng-model with value if checked.
		If ng-model already populated (by using back button), correct radio option is set to checked if model matches value -->
				<div class="input-group" ng-repeat="anchor in thisQuestion.question.anchors">
				  <label class="btn">
				    <input type="radio" name="options" id="{{'Anchor_'+$index}}" autocomplete="off" ng-model="thisQuestion.answer" ng-value="'Anchor_'+$index" ng-checked="model == value"> {{anchor}}
				  </label>
				</div>
		</div>
		<!-- end Multiple choices -->

		<!-- VAS slider -->
		<div class="row" id="VAScontainer" ng-show="thisQuestion.questionType=='VAS'">
			<div class="surveySliderDiv center-block">
				<div class="leftLabelDiv">{{thisQuestion.leftAnchor}}</div>
				<div class="rightLabelDiv">{{thisQuestion.rightAnchor}}</div>
				<!-- Angular compatible ui-slider from https://github.com/angular-ui/ui-slider -->
				<div ui-slider="slider.options" id="slider" class="col-xs-12 col-md-12 col-lg-12" min="0" max="100" ng-model="thisQuestion.answer"></div>
				<input type="text" ng-model="thisQuestion.answer" style="visibility:hidden"/>	
			</div>

			<br/><br/>
			<div>Value: {{thisQuestion.answer}}</div>
			<!-- Initialize slider with jQuery UI <script src="js/slider.js"></script>-->
			
		</div>
		<!-- end VAS slider -->

</div>