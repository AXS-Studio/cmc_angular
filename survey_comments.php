<!-- Survey comments template for ng-include in survey.php -->

<div class="container-fluid col-xs-8 col-md-6 col-lg-6 center-block" style="float: none;">
<form role="form">
	<div class="form-group">	
		<label for="comment">Comment:</label>
		<textarea class="form-control" name="comments" id="comments" placeholder="" rows="5" ng-model="thisQuestion.answer">{{thisQuestion.answer}}</textarea>
		<label for="tags">Tags:</label>
		<input class="form-control" name="tags" id="tags" placeholder="" type="text" ng-model="thisQuestion.inputTag"/>
		<button class="add-tag" ng-click="onAddTagClick()">+</button>
	</div>
</form>

<button type="button" class="btn btn-default" ng-repeat="tag in thisQuestion.tagArray" ng-click="onRemoveTagClick(tag)">{{tag}} <sup style="top: -10px; right: -10px;">&times;</sup></button>

</div>