<?php
session_start();
require_once("query_answers_functions.php");

$answerArray = array(); //Array returned for each questionID
$jsonArray = array(); //Final array returned for AJAX

$patientID=$_REQUEST["patientID"];

//if (isset($_SESSION["userName"]))
//$clinicianID=$_SESSION["userName"];

if(!isset($clinicianID))
$clinicianID="axstest";
//if (isset($_REQUEST["clinicianID"]))
//$clinicianID=$_REQUEST["clinicianID"];

$defaultQuestionArray = array("QIDS_0","SCORE_0","VAS_0","ASRM_0"); //Array containing questionIDs to be queried

//QuestionIDs minus default set. QIDS_0 - 11, ASRM_0 - 4, OTHER_0-1, VAS_0-8
$fullQuestionArray = array(	"QIDS_0", "QIDS_1","QIDS_2","QIDS_3","QIDS_4","QIDS_5","QIDS_6","QIDS_7","QIDS_8","QIDS_9","QIDS_10","QIDS_11",
							"ASRM_0", "ASRM_1","ASRM_2","ASRM_3","ASRM_4",
							"OTHER_0","OTHER_1",
							"VAS_0","VAS_1","VAS_2","VAS_3","VAS_4","VAS_5","VAS_8",
							"SCORE_0");
											
//-------------------------------------------------
//Grab initial load of data
unset($answerArray);

	$questionArray = $fullQuestionArray;

for ($i = 0; $i < count($questionArray); $i++){
	$questionID = $questionArray[$i];
	
	$answerArray['id'] = $questionID;
	
	$answerArray['name'] = getDescription($questionID);
	
	if ($questionID == "SCORE_0")
	$answerArray['name'] = "SCORE_Depression";
	
	//Get question type
	$arr = explode("_", $answerArray['id'], 2);
	$questionType = $arr[0];
	
	//Push in the answers and get length of array
	$answerArray["results"] = getAnswers($patientID, $questionID, $questionType);
	$answerArray["length"] = count($answerArray["results"]);
	array_push($jsonArray, $answerArray);
}
//-------------------------------------------------
//Grab questions that aren't null
unset($answerArray);
for ($i = 0; $i < count($fullQuestionArray2); $i++){
	
	if (!in_array($fullQuestionArray2[$i], $questionArray)){
		$answerArray["id"] = $fullQuestionArray2[$i];
		$answerArray["length"] = answerLength($fullQuestionArray2[$i], $patientID);
		array_push($jsonArray, $answerArray);
	}
}

//-------------------------------------------------
//Grab comments
unset($answerArray);
$answerArray["id"] = "comment";
$answerArray["results"] = getCommentsTags($patientID);
$answerArray["length"] = count($answerArray["results"]);
array_push($jsonArray, $answerArray);

//-------------------------------------------------
//Grab unique tags
unset($answerArray);
$answerArray["id"] = "uniqueTags";
$answerArray["results"] = getUniqueTags($patientID);
//$answerArray["length"] = count($answerArray["results"]);
array_push($jsonArray, $answerArray);

echo json_encode($jsonArray);
exit();
?>