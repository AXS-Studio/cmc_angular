<!-- Survey header/navigation bar -->
<div class="container-fluid grey-bg survey-header" ng-hide="hideSurveyHeader">
	<!-- Back button. ng-hide back button if on question 1 -->
	<button class="btn pull-left" ng-click="onBackClick()" ng-hide="questionNumber=='1'">Back</button>
	<!-- Next/Submit button. ng-disable if question is unanswered, comment section with submit button is the exception -->
	<button class="btn pull-right" ng-click="onNextClick()" ng-disabled="thisQuestion.answer==null && nextButtonText!='Submit'">{{nextButtonText}}</button>
	<!-- Question number. ng-hide if in comment section -->
	<div class="center-block text-center" ng-hide="nextButtonText=='Submit'">{{questionNumber}} of {{totalNumber}}</div>
</div>

<!-- template populated here by controller (eg. survey_start.php, survey_question.php, survey_comments.php) -->
<div class="slide-animate" ng-include="template.url"></div>