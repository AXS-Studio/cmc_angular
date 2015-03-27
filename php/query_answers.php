<?php
session_start();
require_once("query_answers_functions.php");

$answerArray = array(); //Array returned for each questionID

$patientID=$_REQUEST["patientID"];
$questionID=$_REQUEST["questionID"];

$answerArray['id'] = $questionID;
$answerArray['name'] = getDescription($questionID);

//Get question type
$arr = explode("_", $answerArray['id'], 2);
$questionType = $arr[0];
	
$answerArray["results"] = getAnswers($patientID, $questionID, $questionType);

echo json_encode($answerArray);
exit();
?>