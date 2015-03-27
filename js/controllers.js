
    //Define module for entire app
    var mhtApp = angular.module('mhtApp', ['ngRoute', 'mhtControllers', 'ui.slider']);

    mhtApp.config(['$routeProvider', '$locationProvider',
        function($routeProvider, $locationProvider) {

            $routeProvider.
            when('/', {
                templateUrl: 'login.php',
                controller: 'LoginCtrl'
            }).
            when('/login', {
                templateUrl: 'login.php',
                controller: 'LoginCtrl'
            }).
            when('/timeline', {
                templateUrl: 'timeline.php',
                controller: 'TimelineCtrl'
            }).
            when('/survey', {
                templateUrl: 'survey.php',
                controller: 'SurveyCtrl'
            }).
            when('/settings', {
                templateUrl: 'settings.php',
                controller: 'SurveyCtrl'
            });
            // otherwise({
            //   redirectTo: '/login'
            // });

            // Use the HTML5 History API (for pretty URLs), not working on localhost
            //$locationProvider.html5Mode(true);
        }
    ]);
    
    //----------------------------------------------------------
    //Global variables
    //Results get populated as user completes survey, and is submitted to database in controller_login.js
    //Maybe move this to an Angular service or factory as singleton if it makes for better structure
    var results = {
        "patientID": null,
        "sessionID": null,
        "date": null,
        "answers": []
    };

    //----------------------------------------------------------
    //Controllers - Contains logic for each section
    //All controllers are defined in separate files eg.controller_login.js, controller_survey.js etc. 
    var mhtControllers = angular.module('mhtControllers', []);

    //----------------------------------------------------------
