<!doctype html>
<html lang="en" ng-app="mhtApp">
<head>
  <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MHTVP</title>
  
  <link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.css">
  <link rel="stylesheet" href="css/app.css">

  <!-- jQuery scripts -->
  <script src="js/jquery-1.9.1.js"></script>
  <script src="js/jquery-ui-1.10.3.custom.js"></script>
  <script src="js/jquery.ui.touch-punch.min.js"></script>

 <!-- Libraries -->
  <script src="node_modules/angular/angular.js"></script>
  <script src="node_modules/angular-route/angular-route.js"></script>

  <!-- Custom MHT scripts -->
  <script src="js/controllers.js"></script>
  <script src="js/controller_login.js"></script>
  <script src="js/controller_survey.js"></script>
  <script src="js/slider.js"></script>

  <!-- <base href="angular_bootstrap"/> for pretty URLs, not working on localhost-->
</head>
<body>

<!-- Use ng-view for templating suitable page into layout in controller.js  -->
<div ng-view></div>

<footer class="footer grey-bg" ng-hide="hideMenuFooter">
	<div class="container-fluid">
		<div class="row">
		      <div class="col-xs-4 text-center"><a href="./#/timeline">Timeline</a></div>
		      <div class="col-xs-4 text-center"><a href="./#/survey">Survey</a></div>
		      <div class="col-xs-4 text-center"><a href="./#/settings">Settings</a></div>
		</div>
	</div>
</footer>
</body>
</html>