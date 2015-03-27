<?php
session_start();
require_once("database.php");

$myResponse	= array();		//Create array to return session data
$myResponse['result'] = 2;	//Initialize as 2 === Unsuccessful due to database error

//------------------On submission of questionnaire------------------
if (isset($_REQUEST['results']))
{
	//JSON decode results
	$results = $_REQUEST['results'];
	//$myResponse['rawresults'] = $results;
	
	//$results = $mysqli->real_escape_string($results);

	//$myResponse['afterrealescape'] = $results;

	//$results = stripslashes($results);
	
	//$myResponse['afterstripslashes'] = $results;
	
	$results = json_decode($results);
	
	if ($results == NULL){
		$myResponse['error'] = "json decode failed";
		echo json_encode($myResponse);
		exit();
	}
	
	//Read in data from decoded JSON string
	$patientID = $results->{'patientID'};	//"patientID":"Record06"
	$sessionID = $results->{'sessionID'};	//"sessionID":172
	$rawDate = $results->{'date'};			//"date":"2013-01-03T17:51:19.081Z"
	
	//convert $rawDate to php date object
	date_default_timezone_set('America/Toronto');
	$timestamp = strtotime( $rawDate );
	$date = date( DATE_ISO8601, $timestamp );
	
	/*Answer array format:
	"answers":[
	{"id":"mc_0","answer":"Anchor_0"},
	{"id":"mc_1","answer":"Anchor_1"},
	{"id":"mc_2","answer":"Anchor_2"},
	{"id":"comments","answer":"abc"}]
	*/
	$answers = $results->{'answers'};
	$id = "";
	$answer = "";
	$flipped = "";
	
	//For aggregate score
	$answerArray = array(); //associative array which contains all answers from current session
	$dateArray = array(); //associative array which contains all dates from current session
	$tagString =""; //store tags

	//Create prepared mysqli statement
	global $mysqli;
	if ($stmt = $mysqli->prepare("INSERT INTO `Answers`(`PatientID`, `SessionID`, `Date`, `QuestionID`, `Answer`, `Flipped`) VALUES (?,?,?,?,?,?)")) {
		$stmt->bind_param('sisssi', $patientID, $sessionID, $date, $id, $answer, $flipped );	// Bind our param as string
		
		//Iterate through Answer array, and write to database
		foreach($answers as $key => $value){
			$object = $value;
			$id = $object->{'id'};
			$answer = $object->{'answer'};
			
			if (property_exists($object,'flipped')){
				$flipped = $object->{'flipped'};
			}
			else{
				$flipped = 0;
			}
			
			//Convert answer of QIDS and ASRM to numerical
			//$answer = convertAnswer($answer, $id);
			if ($id == "tags"){
				$tagString = $answer;
			}
			else{
				$stmt->execute();
				
				//Insert value into associative array for aggregate score
				$answerArray[$id] = $answer;
				$dateArray[$id] = $date;
			}
			
		}//end foreach
		$stmt->close();
		
		//Update aggregate score
		$score = getAggregate($patientID, $answerArray);
		
		//Insert depression score
		$q = "INSERT INTO `Answers`(`PatientID`, `SessionID`, `Date`, `QuestionID`, `Answer`, `Flipped`) VALUES ('$patientID','$sessionID','$date','SCORE_0',$score,0)";
		$result = $mysqli->query($q);
		
		//$myResponse['debug'] = $mysqli->error;
		
		//Insert tags
		if ($tagString!=""){
			$tagArray = explode(" ", $tagString);

			if ($stmt = $mysqli->prepare("INSERT INTO `Tags`(`PatientID`, `SessionID`, `Tag`, `Date`) VALUES (?,?,?,?)")) {
				$stmt->bind_param('siss', $patientID, $sessionID, $tag, $date );
				
				foreach($tagArray as $value){
					$tag = $value;

					if ($tag!="") //make sure not empty string
					$stmt->execute();
				}
				$stmt->close();
			}//end if mysqli->prepare
		}


		$myResponse['result'] = 1;
	}//end if $stmt=mysqli->prepare
	
	//Update Session_MHT as Completed
	if ($stmt = $mysqli->prepare("UPDATE `Sessions_MHT` SET `Completed` = ?  WHERE `SessionID` = '$sessionID'")){ 
		date_default_timezone_set('America/Toronto');
		$now = date(DATE_ISO8601);
		$stmt->bind_param('s', $now);
		$stmt->execute();
		//$myResponse['error'] = $stmt->error;
		$stmt->close();
	}
	
}//end if isset

//Return success message
//1 === Successful
//2 === Unsuccessful due to database error
echo json_encode($myResponse);
exit();

//Converts multiple choice answers to numerical ones
function convertAnswer($answer, $questionID){
	$arr = explode("_", $questionID, 2); //eg. explode VAS_0 at "_"
	$questionType = $arr[0]; //take the first item
	
	if ($questionType!='VAS' && $questionType!='SCORE'){
		$arr = explode("_", $answer, 2); //eg. explode Anchor_0 at "_"
		$answer = (int) $arr[1]; //take the second item
		
		return (int) $answer;
		/*
		if ($questionType=='OTHER')
		return 100*($answer); //2 choices for OTHER - 0 or 100
		else if ($questionType=='ASRM')
		return 100*($answer)/4; //5 choices for ASRM - 0, 25, 50, 75, 100
		else if ($questionType=='QIDS')
		return 100*($answer)/3; //4 choices for QIDS - 0, 33.33, 66.66, 100		
		*/
	}
	else if ($questionType == 'VAS')
	return (int) $answer;
}

//Computes aggregate score
function getAggregate($patientID, $answerArray){
		
	//List of depression items
	$depressionArray = array("QIDS_0","QIDS_1","QIDS_2","QIDS_3","QIDS_4","QIDS_5","QIDS_6","QIDS_7","QIDS_8","QIDS_9","QIDS_10","QIDS_11", "VAS_4","VAS_8");
	
	//Entire list of questions: QIDS_0 - 11, ASRM_0 - 4, OTHER_0-1, VAS_0-8
	$questionArray = array(	"QIDS_0","QIDS_1","QIDS_2","QIDS_3","QIDS_4","QIDS_5","QIDS_6","QIDS_7","QIDS_8","QIDS_9","QIDS_10","QIDS_11",
							"ASRM_0","ASRM_1","ASRM_2","ASRM_3","ASRM_4",
							"OTHER_0","OTHER_1",
							"VAS_4","VAS_8");
	
	
	//Constants defined by David 
	$COUNT_NONEXISTENT_ITEMS = true;
	$RECENTLY = 14;
	
	//Variables used in keeping score
	$depression_numerator = 0;
	$depression_denomenator = 0;
	$recently_asked_items = 0;
	$max_appetite_score = -1;
	$max_psychomotor_score = -1;
	
	$depression_score = 0;
	
	//Write to log file for checking scoring accuracy
	chmod("QIDSlog.txt",0777);
	$myFile = "QIDSlog.txt";
	$fh = fopen($myFile, 'a');// or print_r("can't open file");
	fwrite($fh, '--------Log for '.$patientID." (".date("Y-m-d H:i:s").")--------\r\n");
	
	global $mysqli;
	//----------Loop through entire set of questions, filling in blanks if LOCF found----------
for ($i = 0; $i < sizeof($questionArray); $i++){
	$currentQID = $questionArray[$i];
	//fwrite($fh, '--------'.$currentQID."---------\r\n");
	if (in_array($currentQID, $depressionArray)){
		
		//If current questionID does not exist as a key in answerArray from patient...
		if (!array_key_exists($currentQID, $answerArray)){		
			//Need to find Last Observation Carried Forward
			$q = "SELECT MAX(`Date`) AS `Date`, `Answer` FROM `Answers` WHERE `PatientID` = '$patientID' AND `QuestionID` = '$currentQID'";
			if ($result = $mysqli->query($q)){
				//Query successful, import answers and dates
				$row = $result->fetch_assoc();
				
				$row['Answer'] = convertAnswer($row['Answer'], $currentQID);
				
				$answerArray[$currentQID] = $row['Answer'];
				$dateArray[$currentQID] = $row['Date'];
				
				fwrite($fh, $currentQID." ".$row['Answer']." (LOCF ".$row['Date'].")\r\n");
			}//end if result
			else{
				$answerArray[$currentQID] = -1;
				$dateArray[$currentQID] = -1;
			}
		}//end if !array_key_exists
		else{
			//Convert answers to right format:
			$answerArray[$currentQID] = convertAnswer($answerArray[$currentQID], $currentQID);
			fwrite($fh, $currentQID." ".$answerArray[$currentQID]."\r\n");
		}
		
		//------------Tally current item to Depression Score---------------
		if ($answerArray[$currentQID] > -1){
			
			//Number of days between two dates
			$datediff = time() - strtotime("2010-01-01");
			$datediff = floor($datediff/(60*60*24));
			if ($datediff <= $RECENTLY) //LOCF is recent
			$recently_asked_items++;
						
			switch ($currentQID){		
				case 'VAS_4': //VAS_Hours Slept Last Night (4-12 hours)
					//VAS scores are integers in the range (0,100)
					//Score reflects how far away they are from mid-point of the scale (8 hrs).
					//Take magnitude of distance from middle and scale to a 0-to-3 point score
					//Need to divide by 2 since sleep items are averaged
					$dist = abs($answerArray[$currentQID] - 50)*2;
					$depression_score += $dist/100*(3/2);
					$depression_denomenator+=1.5;
					
					fwrite($fh, 'VAS_4 (Hours Slept) '.$dist*(3/2)."\r\n");
					fwrite($fh, 'Depression_score '.$depression_score." over ".$depression_denomenator."\r\n");
					break;
				case 'VAS_8': //VAS_Quality of Sleep (Worst to Best ever)
					//Subtract score from 100, since low Qual-of-sleep corresponds to a higher depression rating
					$depression_score += ((100-$answerArray[$currentQID])/100)*(3/2);
					$depression_denomenator+=1.5;
					fwrite($fh, 'VAS_8 (Quality of Sleep) '.((100-$answerArray[$currentQID])/100)*(3/2)."\r\n");
					fwrite($fh, 'Depression_score '.$depression_score." over ".$depression_denomenator."\r\n");
					break;
				case 'QIDS_0':
				case 'QIDS_5':
				case 'QIDS_6':
				case 'QIDS_7':
				case 'QIDS_8':
				case 'QIDS_9':
					//QIDS scores are integers in the range (0,3)
					$depression_score += $answerArray[$currentQID];
					$depression_denomenator+=3;	//an instance of the item exists, so count it.
					fwrite($fh, 'Depression_score '.$depression_score." over ".$depression_denomenator."\r\n");
					break;
				case 'QIDS_1':
				case 'QIDS_2':
				case 'QIDS_3':
				case 'QIDS_4':
					$max_appetite_score = max($max_appetite_score,$answerArray[$currentQID]);
					fwrite($fh, $currentQID.' '.$answerArray[$currentQID]." max app is ".$max_appetite_score."\r\n");
					break;
				case 'QIDS_10':
				case 'QIDS_11':
					$max_psychomotor_score = max($max_psychomotor_score,$answerArray[$currentQID]);
					fwrite($fh, $currentQID.' '.$answerArray[$currentQID]." max psycho is ".$max_psychomotor_score."\r\n");
					break;
			}//end switch
			
		}//end if ($answerArray[$currentQID] != '') instance of item exists
		else{//No instance of the item exists in the database, so....
				if ($COUNT_NONEXISTENT_ITEMS == true){
				switch (item_number) {
					case 'VAS_4':
					case 'VAS_8':
						$depression_denomenator+=1.5;
						//echo 'non-exist depression_denomenator: '.$depression_denomenator.'</br>';
						break;
					case 'QIDS_0':
					case 'QIDS_5':
					case 'QIDS_6':
					case 'QIDS_7':
					case 'QIDS_8':
					case 'QIDS_9':
						$depression_denomenator+=3;
						//echo 'non-exist depression_denomenator: '.$depression_denomenator.'</br>';
						break;
					case 'QIDS_1':
					case 'QIDS_2':
					case 'QIDS_3':
					case 'QIDS_4':
					case 'QIDS_10':
					case 'QIDS_11':
						//appetite and psyychomotor items: see below
						break;
				}//end switch
			}//end if ($COUNT_NONEXISTENT_ITEMS == TRUE)
			else if ($COUNT_NONEXISTENT_ITEMS == false){
			//if question has never been asked, don't increase the denominator 
			}
	}//end else
			
	}//end if in_array depression
	
}//end for loop
//Finally, add the 'greatest-of' appetite and psychomotoric scores to numerator
$depression_score += $max_appetite_score;
$depression_score += $max_psychomotor_score;
				
if ($max_appetite_score >= 0) //at least one appetite item exists
$depression_denomenator+=3;

if ($max_psychomotor_score >= 0) //at least one psychomotor item exists
$depression_denomenator+=3;

fwrite($fh, 'Added up app and psycho - Depression_score '.$depression_score." over ".$depression_denomenator."\r\n");

//----------Now actually calculate aggregate score----------
//echo '</br><pre>answerArray: ';
//print_r($answerArray);
//echo '</pre></br>';


fwrite($fh, '---------Depression_score '.$depression_score." over ".$depression_denomenator."------------------\r\n\r\n");
					
$depression_score = 100*$depression_score/$depression_denomenator;

fclose($fh);

return $depression_score;
}//end getAggregate
?>
