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

if (isset($_REQUEST["sessionName"]))
	$sessionName=$_REQUEST["sessionName"];
else
	$sessionName=NULL;

$defaultQuestionArray = array("QIDS_0","SCORE_0","VAS_0","ASRM_0"); //Array containing questionIDs to be queried

//QuestionIDs minus default set. QIDS_0 - 11, ASRM_0 - 4, OTHER_0-1, VAS_0-8
$fullQuestionArray = array(	"QIDS_1","QIDS_2","QIDS_3","QIDS_4","QIDS_5","QIDS_6","QIDS_7","QIDS_8","QIDS_9","QIDS_10","QIDS_11",
							"ASRM_1","ASRM_2","ASRM_3","ASRM_4",
							"OTHER_0","OTHER_1",
							"VAS_1","VAS_2","VAS_3","VAS_4","VAS_5","VAS_8");
							
//QuestionIDs. QIDS_0 - 11, ASRM_0 - 4, OTHER_0-1, VAS_0-8
$fullQuestionArray2 = array("QIDS_0", "QIDS_1","QIDS_2","QIDS_3","QIDS_4","QIDS_5","QIDS_6","QIDS_7","QIDS_8","QIDS_9","QIDS_10","QIDS_11",
							"ASRM_0","ASRM_1","ASRM_2","ASRM_3","ASRM_4",
							"OTHER_0","OTHER_1",
							"VAS_0","VAS_1","VAS_2","VAS_3","VAS_4","VAS_5","VAS_8");
//-------------------------------------------------
//Grab sessions
$answerArray["id"] = "sessions";
$answerArray["info"] = getSessions($patientID, $clinicianID, $sessionName);
array_push($jsonArray, $answerArray);

//Grab QuestionIDs if loading up a session
$sessionQuestionArray = array();
$sessionColourArray = array(); //&& $answerArray["info"]["current"]['data'] != NULL
if (isset($sessionName) ){
	//Now get data sets for which the clinician was last looking at
	$dataArray = $answerArray["info"]["current"]['data']['settings'];
	for($i=0; $i<sizeof($dataArray); $i++) {
		if ($dataArray[$i]['colour'] != 'transparent'){
			$sessionQuestionArray[] = $dataArray[$i]['id'];
			$sessionColourArray[] = $dataArray[$i]['colour'];
		}
	}
	//$jsonArray['test'][] = $sessionQuestionArray;
}
				
//-------------------------------------------------
//Grab initial load of data
unset($answerArray);

if ($sessionQuestionArray != NULL){
	$questionArray = $sessionQuestionArray;
	$colourArray = $sessionColourArray;
}
else{
	$questionArray = $defaultQuestionArray;
	$colourArray = null;
}

for ($i = 0; $i < count($questionArray); $i++){
	$questionID = $questionArray[$i];
	
	$answerArray['id'] = $questionID;
	
	if ($colourArray!= null)
	$answerArray['colour'] = $colourArray[$i];//will be rgba(255,0,0,1.0) format
	else
	$answerArray['colour'] = null;
	
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

//Grab tags
// unset($answerArray);
// $answerArray["id"] = "tags";
// $answerArray["results"] = getTags($patientID);
// $answerArray["length"] = count($answerArray["results"]);
// array_push($jsonArray, $answerArray);


//-------------------------------------------------
//Grab clinician notes
/*
unset($answerArray);
$answerArray["id"] = "notes";
$answerArray["results"] = getClinicianNotes($patientID, $clinicianID);
$answerArray["length"] = count($answerArray["results"]["notes"]);
array_push($jsonArray, $answerArray);
*/

echo json_encode($jsonArray);
exit();
?>