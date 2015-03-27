 //LoginController
    //TODO:
    //Reset password workflow
    //Prevent double submit
    mhtControllers.controller('LoginCtrl', ['$scope', '$http', '$location',
        function($scope, $routeParams, $location) {

            $scope.formData = {inputEmail:'', inputPassword:'', inputRemember:'' };
            
            $scope.$parent.hideMenuFooter = true; //menu footer located in parent of ng-view

            $scope.signIn = function(formData) {

                var data = {
                    userId: formData.inputEmail,
                    password: formData.inputPassword,
                    remember: formData.inputRemember
                };

                $.ajax({
                    type: 'POST',
                    url: 'php/login.php',
                    data: data,
                    dataType: 'json',
                    success: function(json) {
                        console.log(json.result);
                        var loginError;
                        if (json.result === 1) {
                            //Success! Save patient ID and email
                            results.patientID = json.patientID;
                            results.patientEmail = json.patientEmail;
                            console.log(results);
                            
                            //Submit prev results in localStorage for delivery if internet connection lost in prev session
                            if (localStorage.getItem('lsResults')) {
                                $.ajax({
                                    type: 'POST',
                                    url: 'php/submit.php',
                                    data: {
                                        "results": localStorage.getItem('lsResults')
                                    },
                                        success: function(message) {
                                            localStorage.removeItem('lsResults');
                                            $location.path('survey'); //Change location to survey by default
                                        },
                                        error: function() {
                                            window.alert('Error submitting previously saved survey!');
                                        }
                                });
                            }
                            else
                            $location.path('survey'); //Change location to survey by default

                        } else if (json.result === 0) {
                            loginError = 'Cannot connect to the MHT server';
                        } else if (json.result === 2) {
                            loginError = 'Wrong password';
                        } else if (json.result === 3) {
                            loginError = 'User not found';
                        } else if (json.result === 4) {
                            loginError = 'User not enabled';
                        } else {
                            loginError = 'Error';
                        }
                        //Manually update scope as change happened inside AJAX and outside of angular
                        $scope.$apply(function () {
                            $scope.loginError = loginError;
                        });
                    },
                    error: function() {
                        $scope.loginError = 'Cannot connect to the MHT server';
                    }
                });
            };
        }
    ]); //end LoginCtrl