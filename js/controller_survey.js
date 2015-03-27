//SurveyController
//Handles all functionality in survey
//Makes calls to database to download survey+tags and upload completed answers
//Switches up questions and pages using templates in survey.php

//TODO:
//-Backend integration for tags, add autocompletion via plugin
//-Alert if user leaves in the middle of survey
//-Prevent double clicks and double submits

mhtControllers.controller('SurveyCtrl', ['$scope', '$http', '$location',
    function($scope, $http, $location) {

        var currentQuestionIndex = 0; //Index for questionnaire array

        //var previousTagsArray = new Array(); //TODO: All previously submitted tags

        //Templates for survey.php using ng-include
        $scope.templates = [{
            name: 'survey_start.php',
            url: 'survey_start.php'
        }, {
            name: 'survey_question.php',
            url: 'survey_question.php'
        }, {
            name: 'survey_comments.php',
            url: 'survey_comments.php'
        }, {
            name: 'survey_end.php',
            url: 'survey_end.php'
        }];

        //Initialize survey (show button to let user start survey)
        var initialize = function() {
            $scope.$parent.hideMenuFooter = false; //show menu footer (if hidden during login)

            $scope.template = $scope.templates[0]; //Use survey_start template
            $scope.hideSurveyHeader = true; //hide surveyHeader navigation bar until survey started
        };

        //Add alert if user leaves in the middle of survey, reset survey if they do
        //This works, but need to disable this if user finished survey (on survey_end.php)
        // $scope.$on('$locationChangeStart', function( event ) {
        //     var answer = confirm("Your answers are not submited until you complete the survey. Are you sure you want to leave this page?")
        //     if (!answer) {
        //         event.preventDefault();
        //     }
        // });

        //Start button clicked, download questionnaire from server
        $scope.onStartClick = function() {
            $scope.template = $scope.templates[1];
            $scope.hideSurveyHeader = false;

            //TODO: AJAX DOWNLOAD SURVEY HERE (And populate results array with patientID, sessionID etc.)
            $.ajax({
                type: 'POST',
                url: 'php/query_questionnaire.php',
                data: results,
                dataType: 'json',
                success: function(json) {
                    questionnaire = json;

                    //Randomize questions
                    if (questionnaire.randomize == 1)
                        questionnaire.questions = fisherYates(questionnaire.questions);

                    //Create a blank array in results to store user answers
                    for (i = 0; i < questionnaire.questions.length; i++) {
                        results.answers.push({
                            "id": null,
                            "answer": null
                        });
                    }
                    results.answers.push({
                        "id": "comments",
                        "answer": null
                    });
                    results.answers.push({
                        "id": "tags",
                        "answer": null
                    });

                    //Manually update scope as change happened inside AJAX and outside of angular
                    $scope.$apply(function() {
                        $scope.totalNumber = questionnaire.questions.length;
                        refreshQuestion();
                    });
                }
            });

            //TODO: AJAX DOWNLOAD TAGS HERE (And update variables, import autocomplete plugins)
            // $.ajax({
            //     type: 'POST',
            //     url: 'php/get_tags.php',
            //     data: {
            //         patientID: results.patientID
            //     },
            //     success: function(message) {
            //         tags_arr = jQuery.parseJSON(message);
            //         if (tags_arr != null)
            //         $( "#tags" ).autocomplete({
            //             source: tags_arr, 
            //         });
            //     },
            //     error: function() {}
            // });

        };

        //Back button clicked
        $scope.onBackClick = function() {
            //Back clicked on normal survey questions
            if (currentQuestionIndex > 0 && currentQuestionIndex < questionnaire.questions.length) {
                saveAnswer();
                currentQuestionIndex--;
                refreshQuestion();
            }
            //Back clicked on comment
            else if (currentQuestionIndex == questionnaire.questions.length) {
                saveComment();
                $scope.template = $scope.templates[1];
                currentQuestionIndex--;
                refreshQuestion();
            }
        };

        //Next button clicked
        $scope.onNextClick = function() {
                //Show normal survey question
                if (currentQuestionIndex < questionnaire.questions.length - 1) {
                    saveAnswer();
                    currentQuestionIndex++;
                    refreshQuestion();
                }
                //Show Comment template
                else if (currentQuestionIndex == questionnaire.questions.length - 1) {
                    saveAnswer();
                    currentQuestionIndex++;

                    $scope.template = $scope.templates[2]; //Change template
                    $scope.nextButtonText = "Submit";
                    $scope.thisQuestion.answer = null; //Reset answer for comments

                    //If previously answered, populate answers for scope
                    $scope.thisQuestion.answer = results.answers[currentQuestionIndex].answer;
                    $scope.thisQuestion.tagArray = results.answers[currentQuestionIndex + 1].answer;

                    if ($scope.thisQuestion.tagArray == null) //Create tagArray to store tags if entering comments the first time
                        $scope.thisQuestion.tagArray = [];
                }
                //Submit button on Comment clicked
                else if (currentQuestionIndex == questionnaire.questions.length) {
                    saveComment();

                    //Populate results with user details
                    results.patientID = questionnaire.patientID;
                    results.sessionID = questionnaire.sessionID;
                    results.date = new Date();

                    //AJAX submit answers to database
                    var rJson = JSON.stringify(results);
                    localStorage.setItem('lsResults', rJson);
                    $.ajax({
                        type: 'POST',
                        url: 'php/submit.php',
                        data: {
                            "results": rJson
                        },
                        success: function(message) {
                            localStorage.removeItem('lsResults');
                            results.answers = []; //empty array if previously filled

                            //Manually update scope as change happened inside AJAX and outside of angular
                            $scope.$apply(function() {
                                $scope.hideSurveyHeader = true;
                                $scope.template = $scope.templates[3]; //Use survey_end template
                            });
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            console.log(errorThrown);
                            alert("Your survey did not submit. Your answers to this survey will submit automatically the next time you successfully log in.");
                        }
                    });
                }
            } //end onNextClick

        //Add tag button clicked in comments
        $scope.onAddTagClick = function() {
            var thisTag = $scope.thisQuestion.inputTag;
            $scope.thisQuestion.inputTag = null; //reset input field

            //Check for empty strings and repeats
            if (thisTag === '' || $scope.thisQuestion.tagArray.indexOf(thisTag) > -1)
                return;

            //Strip illegal characters
            var regex = /[^\w-]/gi; //only allow alpha numeric ( a-z, A-Z, 0-9), hypen and underscore
            thisTag = thisTag.replace(regex, ''); //Strip unwanted characters

            //TODO (UNCOMMENT AND UPDATE VARIABLES WHEN AJAX IN PLACE)
            // Search if there is another tag with the same case in tag_arr (received from database)
            // Iterate over tag_arr, select the first elements that equalsIgnoreCase the "tag" value                
            // if (previousTagsArray !=null){
            //     $.each(previousTagsArray, function(index, value) { 
            //       if ( value.toLowerCase()=== tag.toLowerCase() )
            //       tag = value;
            //     });
            // }

            $scope.thisQuestion.tagArray.push(thisTag);
        };

        //Remove tag button clicked in comments
        $scope.onRemoveTagClick = function(inTag) {
            var index = $scope.thisQuestion.tagArray.indexOf(inTag);

            if (index > -1)
                $scope.thisQuestion.tagArray.splice(index, 1);
        };

        //Logout button clicked in survey_end
        $scope.onLogoutClick = function(inTag) {
            $location.path('login');
        };

        //Display correct question text and highlight selected option if previously answered
        var refreshQuestion = function() {
            $scope.nextButtonText = "Next";
            $scope.questionNumber = currentQuestionIndex + 1;

            $scope.thisQuestion = {};
            $scope.thisQuestion.question = questionnaire.questions[currentQuestionIndex];
            $scope.thisQuestion.answer = null;
            $scope.thisQuestion.questionType = "MC"; //Set as Multiple Choice by default

            var specificType = $scope.thisQuestion.question.questionID.split('_')[0]; //Determine specific type: VAS, ASRM, QIDS, OTHER

            //If previously answered, populate answer for scope...
            $scope.thisQuestion.answer = results.answers[currentQuestionIndex].answer;
            //...with exception of a flipped VAS
            if (results.answers[currentQuestionIndex].flipped == 1)
                $scope.thisQuestion.answer = 100 - results.answers[currentQuestionIndex].answer;

            if (specificType === "VAS") {
                $scope.thisQuestion.questionInstruction = "Using the line below, please rate";
                $scope.thisQuestion.questionType = "VAS";
                $scope.slider = {
                    'options': {
                        create: function(event, ui) { //Called when template is loaded
                            if ($scope.thisQuestion.answer == null)
                                $('.ui-slider-handle').hide();
                        },
                        start: function(event, ui) {
                            $('.ui-slider-handle').show();
                        }
                    }
                };

                if ($scope.thisQuestion.answer == null) //Hide handle for slider if question unanswered
                    $('.ui-slider-handle').hide();

                //Flip anchors if enabled and haven't been assigned
                if (results.answers[currentQuestionIndex].flipped == null) {
                    if (questionnaire.flip == 1)
                        results.answers[currentQuestionIndex].flipped = Math.round(Math.random());
                    else
                        results.answers[currentQuestionIndex].flipped = 0;
                }
                //Depending on flipped variable set the VAS anchors
                if (results.answers[currentQuestionIndex].flipped == 1) {
                    $scope.thisQuestion.leftAnchor = questionnaire.questions[currentQuestionIndex].anchors[1];
                    $scope.thisQuestion.rightAnchor = questionnaire.questions[currentQuestionIndex].anchors[0];
                } else {
                    $scope.thisQuestion.leftAnchor = questionnaire.questions[currentQuestionIndex].anchors[0];
                    $scope.thisQuestion.rightAnchor = questionnaire.questions[currentQuestionIndex].anchors[1];
                }

            } else if (specificType === "ASRM") {
                if (questionnaire.questions[currentQuestionIndex].days > 1)
                    $scope.thisQuestion.questionInstruction = "Choose which statement best describes the way you have been feeling for the past " + questionnaire.questions[currentQuestionIndex].days + " days";
                else
                    $scope.thisQuestion.questionInstruction = "Choose which statement best describes the way you have been feeling for the past day";
            } else if (specificType === "QIDS") {
                if (questionnaire.questions[currentQuestionIndex].days > 1)
                    $scope.thisQuestion.questionInstruction = "Please select the one response that best describes you for the past " + questionnaire.questions[currentQuestionIndex].days + " days";
                else
                    $scope.thisQuestion.questionInstruction = "Please select the one response that best describes you for the past day";
            } else if (specificType === "OTHER") {
                if (questionnaire.questions[currentQuestionIndex].days > 1)
                    $scope.thisQuestion.questionInstruction = "Please indicate in the last " + questionnaire.questions[currentQuestionIndex].days + " days";
                else
                    $scope.thisQuestion.questionInstruction = "Please indicate in the last day";
            }
        };

        //Push answer into results array, called in onNextClick
        var saveAnswer = function() {
            results.answers[currentQuestionIndex].id = questionnaire.questions[currentQuestionIndex].questionID;
            results.answers[currentQuestionIndex].answer = $scope.thisQuestion.answer; //Anchor_0, Anchor_1 etc.

            if (results.answers[currentQuestionIndex].flipped == 1)
                results.answers[currentQuestionIndex].answer = 100 - $scope.thisQuestion.answer;

            console.log(results.answers);
        }

        //Push comments and tags into results array, called in onNextClick
        var saveComment = function() {
            results.answers[currentQuestionIndex].id = "comments";
            results.answers[currentQuestionIndex].answer = $scope.thisQuestion.answer;
            results.answers[currentQuestionIndex + 1].id = "tags";
            results.answers[currentQuestionIndex + 1].answer = $scope.thisQuestion.tagArray;

            console.log(results.answers);
        }

        //For randomizing survey questions if enabled
        var fisherYates = function(myArray) {
            var i = myArray.length;
            if (i == 0)
                return false;
            while (--i) {
                var j = Math.floor(Math.random() * (i + 1));
                var tempi = myArray[i];
                var tempj = myArray[j];
                myArray[i] = tempj;
                myArray[j] = tempi;
            }
            return myArray;
        }

        initialize(); //Initialize survey (show button to let user start survey)
    }
]); //end SurveyCtrl
