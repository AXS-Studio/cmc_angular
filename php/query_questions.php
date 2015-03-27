<?php
session_start();
require_once("database.php");

$jsonArray = array(); //Final array returned for AJAX

$bus = array();

$ASRMArray = array();
$QIDSArray = array();
$VASArray = array();
$OTHERArray = array();
$AGGREGATEArray = array();

global $mysqli;
$q = "SELECT `QuestionID`,`Description` FROM `Questions` ORDER BY `Order`";
if ($result = $mysqli->query($q)){	
	while($row = $result->fetch_assoc()){
	
		$bus['id'] = $row['QuestionID'];
		$bus['name'] = $row['Description'];
		
		//Get question type
		$arr = explode("_", $bus['name'], 2);
		$questionType = $arr[0];
		//Format question description
		$bus['name'] = $arr[1];
		
		//Push into correct array
		if ($questionType == 'VAS'){
			array_push($VASArray, $bus);
		}
		else if ($questionType == 'ASRM'){
			array_push($ASRMArray, $bus);
		}
		else if ($questionType == 'QIDS'){
			array_push($QIDSArray, $bus);
		}
		else if ($questionType == 'OTHER'){
			array_push($OTHERArray, $bus);
		}
		else if ($questionType == 'SCORE'){
			array_push($AGGREGATEArray, $bus);
		}
		unset($bus);
	}//end while
	$result->free();
	
	//Produce finalized json array for output
	$bus["category"] = "ASRM";
	$bus["type"] = $ASRMArray;
	array_push($jsonArray, $bus);
	unset($bus);
	
	$bus["category"] = "QIDS";
	$bus["type"] = $QIDSArray;
	array_push($jsonArray, $bus);
	unset($bus);
	
	$bus["category"] = "VAS";
	$bus["type"] = $VASArray;
	array_push($jsonArray, $bus);
	unset($bus);
	
	$bus["category"] = "OTHER";
	$bus["type"] = $OTHERArray;
	array_push($jsonArray, $bus);
	unset($bus);
		
	$AGGREGATEArray["id"] = "SCORE_0";
	$AGGREGATEArray["name"] = "QIDS Score";
	
	$bus["category"] = "Aggregate Scores";
	$bus["type"] = $AGGREGATEArray;
	array_push($jsonArray, $bus);
	unset($bus);
}
else{
	$jsonArray["error"] = 'Database error: '.$mysqli->error;;
}

echo json_encode($jsonArray);
exit();

/*For reference: final json array for front-end display of question list
[{
   "category": "ASRM",
   "type": [
			{
					"id": "fa",
					"name": "Falling asleep"
			},
			{
					"id": "sdtn",
					"name": "Sleep during the night"
			},
			{
					"id": "wute",
					"name": "Waking up too early"
			}
	]
},
{
	"category": "QIDS",
	"type": [
			{
					"id": "fa",
					"name": "Falling asleep"
			},
			{
					"id": "sdtn",
					"name": "Sleep during the night"
			},
			{
					"id": "wute",
					"name": "Waking up too early"
			}
	]
},
{
	"category": "VAS",
	"type": [
			{
					"id": "fa",
					"name": "Falling asleep"
			},
			{
					"id": "sdtn",
					"name": "Sleep during the night"
			},
			{
					"id": "wute",
					"name": "Waking up too early"
			}
	]
 }]
*/
?>