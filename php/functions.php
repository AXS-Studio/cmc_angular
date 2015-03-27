<?php
session_start();
error_reporting(0);
require_once("database.php");
require_once("password_hash.php");

if(count(get_included_files()) ==1) exit("Error, direct access prohibited");

//------------------Functions called from login------------------

//Autheticate user against database
//0 === Database error
//1 === Success
//2 === Wrong password
//3 === Wrong username
//4 === User not enabled
function confirmUser($userEmail, $password, $remember){
	
	//First check if:
	//1) Cookies were set and valid
	//2) And if password field unchanged (contains only asterisks eg. '***')
	//return 1 for success to log user in
	if (checkCookie($remember)==1 && preg_match('/^\**$/', $password)){
		return 1;
	}
	//else continue as normal if:
	//1) cookies not set or invalid
	//2) user changed value in password field
	
	//Create prepared mysqli statement to prevent hacking by injection
	global $mysqli;
	
	if ($stmt = $mysqli->prepare("SELECT `Password`,`Enabled` FROM `Patient` WHERE `Email` = ?")) {
		$stmt->bind_param('s', $userEmail);	// Bind our param as string
		$stmt->execute();					// Execute the prepared Statement
		$stmt->bind_result($dbPassword, $userEnabled); 	//Bind result
		$stmt->fetch();	
		
		if (empty($dbPassword)){
    		return 3; //Username failure
		}
		else{			
			if ($userEnabled == '0')
			return 4; //User not enabled
			else if( validate_password($password, $dbPassword))
			return 1; //Success! Username and password confirmed
			else
			return 2; //Password failure	
		}
		$stmt->close();	// Close the statement
	}
	else{
			//echo "error " .$mysqli->error;
			return 0; //Database call error
	}
}//end confirmUser

//Creates JSON response upon sucessful authentication
function createResponse($userEmail){
	//Create new session, check if infreq survey, and populate array with session data
	$myResponse	= createSessionArray($userEmail);
	if ($myResponse['result'] == 0){
		return $myResponse;	//Database failure
	}

	//Send questionnaire
	$myResponse["questions"]=getQuestions($userEmail, $myResponse["infreq"]);
	return $myResponse;
}

//Create a new session, returns array of session data
function createSessionArray($userEmail){
	
	$myResponse	= array();		//Create array to return session data
	$myResponse["result"] = 0; 	//Set default return value to Fail, Pass if function gets to the end
	
	//Get PatientID
	global $mysqli;
	if ($result = $mysqli->query("SELECT `MedicalRecordNum` FROM `Patient` WHERE `Email` = '$userEmail'")){
		$row = $result->fetch_assoc();
		$patientID = $row['MedicalRecordNum'];
		$result->free();
	}
	else{
		return $myResponse;
	}
	
	//Get number of days (currently set to days between each infreq survey)
	date_default_timezone_set('America/Toronto');
	$q = "SELECT `LongFormFrequency`,`RandomizeVASAnchors`,`RandomizeQuestions`,
	DATE_FORMAT(`StartDate`,'%Y-%m-%d') AS `StartDate` 
	FROM `QuestionnaireSettings` WHERE `PatientID` = '$patientID'";
	if ($result = $mysqli->query($q)){
		$row = $result->fetch_array(MYSQLI_ASSOC);
		$days = intval($row['LongFormFrequency']);
		$flipped = intval($row['RandomizeVASAnchors']);
		$randomized = intval($row['RandomizeQuestions']);
		$startDate = $row['StartDate'];
		$now = date("Y-m-d");
		$result->free();
	}//end query
	else{
		return $myResponse;
	}
	
	//Detect if survey should be Frequent or Infrequent set of questions
	$infreqBool = 0;  					//true if Infrequent	
	$currentDate = strtotime($now);		//returns Unix timestamp of today
	$startDate = strtotime($startDate);	//returns Unix timestamp of survey start date
    $daysDiff = abs($currentDate - $startDate);
   	$daysDiff = floor($daysDiff/(60*60*24));	//returns number of days between today and start date
		
   	//Update for David (24 Feb 2015). Once approved, uncomment all lines 113-125 and line 150.
   	//First check if any infreq surveys within one cycle ago (ie. today - LongFormFrequency)
   	//$oneCycleAgo = strtotime ( '-'.$days.' day' , $currentDate ) ;
   	//$oneCycleAgo = date('Y-m-d', $oneCycleAgo);

   	//$q = "SELECT * FROM `Sessions_MHT` WHERE `Date` >= '$oneCycleAgo'  AND `Date` <= '$currentDate' AND `PatientID` = '$patientID' AND `Infreq` = 1";
	//$result = $mysqli->query($q);

	//if user has not completed any infreq surveys within one cycle, send infreq survey
	//if($result->num_rows == 0)
	//	$infreqBool = 1;
	//else if($result->num_rows > 0)
	//{
		//Check if today is scheduled for infrequent survey
		//eg. Infreq surveys set to every 3 days, today is 6 days since startDate ($days == 3, $daysDiff == 6), return true
		if ($days>0 && $daysDiff % $days == 0){
			//Infrequent survey day. Since patients can do multiple surveys per day
			//Will have to check if user has already done infreq survey on this day
			$q = "SELECT * FROM `Sessions_MHT` WHERE DATE_FORMAT(`Date`,'%Y-%m-%d') = '$now'
			AND `PatientID` = '$patientID' AND `Infreq` = 1";
			$result = $mysqli->query($q);
			
			if($result->num_rows >= 1){
				$row = $result->fetch_array(MYSQLI_ASSOC);
				
				if ($row['Completed'] != "0000-00-00 00:00:00"){ //Check if user completed the survey
				$myResponse["completed"]= $row['Completed'];
				$infreqBool = 0; //User already completed infreq survey on this day
				}else{
				$infreqBool = 1;
				}
			}
			else{
				$infreqBool = 1;
			}
			$result->free();
		}
	//}//end else if($result->num_rows > 0)
	
	//Insert session details into database
	$sessionTime = date(DATE_ISO8601);
	$q = "INSERT INTO `Sessions_MHT`(`PatientID`, `Date`, `Infreq`, `Flipped`, `Randomized`, `Completed`,`IP`, `Browser`)
	VALUES ('$patientID','$sessionTime','$infreqBool','$flipped','$randomized','0','".$_SERVER['REMOTE_ADDR']."','".$_SERVER['HTTP_USER_AGENT']."')";
	if ($result = $mysqli->query($q))
	{
		$myResponse["sessionID"]= $mysqli->insert_id; 	//sessionID is autoIncrement, so obtain last ID inserted
		$myResponse["patientID"]= $patientID; 			//Medical Record Number, not email as MRN is permanent
		$myResponse["randomize"]= $randomized;
		$myResponse["flip"]= $flipped;
		$myResponse["infreq"]= $infreqBool;
		$myResponse["result"]= 1;
	}
	else{
		return $myResponse;
	}
	
	return $myResponse;
}//end createSession

//Called during login to return a patientID from email
function getPatientID($userEmail){
	global $mysqli;

	$myResponse	= array();
	$myResponse["result"] = 0; 	//Set default return value to Fail, Pass if function gets to the end

	//Get PatientID
	$q = "SELECT MedicalRecordNum FROM `Patient` WHERE `Email` = '$userEmail'";
	if ($result = $mysqli->query($q)){
		$row = $result->fetch_assoc();
		$patientID = $row['MedicalRecordNum'];
		$result->free();

		$myResponse["result"] = 1;
		$myResponse["patientID"]= $patientID;
		$myResponse["patientEmail"]= $userEmail;
	}
	else{
		return $myResponse;
	}

	return $myResponse;
}

//Get complete set of Questions
function getQuestions($userEmail, $infreqBool){
	global $mysqli;
	//Get PatientID
	$q = "SELECT MedicalRecordNum FROM `Patient` WHERE `Email` = '$userEmail'";
	if ($result = $mysqli->query($q)){
	$row = $result->fetch_assoc();
	$patientID = $row['MedicalRecordNum'];
	$result->free();
	}
	
	//Get number of days (currently set to days between each infreq survey)
	$q = "SELECT `LongFormFrequency` FROM `QuestionnaireSettings` WHERE `PatientID` = '$patientID'";
	if ($result = $mysqli->query($q)){
	$row = $result->fetch_assoc();
	$days = intval($row['LongFormFrequency']);
	$result->free();
	}
	
	//Get questions
	if ($infreqBool){
	$q = "SELECT * FROM `Questions` AS Questions
	INNER JOIN PatientToQuestions AS PTQ ON PTQ.QuestionID = Questions.QuestionID
	WHERE PTQ.PatientID = '$patientID' 
	AND PTQ.Include = 1
	ORDER BY `Order`";
	}
	else{
	$q = "SELECT * FROM `Questions` AS Questions
	INNER JOIN PatientToQuestions AS PTQ ON PTQ.QuestionID = Questions.QuestionID
	WHERE PTQ.PatientID = '$patientID' 
	AND PTQ.Include = 1 AND PTQ.Infreq = 0
	ORDER BY `Order`";
	}
	$questionArray = array();
	if ($result = $mysqli->query($q)){
		while($row = $result->fetch_assoc()){		
			$bus = array(
				'questionID' => $row['QuestionID'],
				'stem' =>  stripslashes($row['Stem']),
				'days' => $days);
			
			//Change days to 1 if this is a freq survey or if the question is set to frequent
			if (!$infreqBool || !$row['Infreq'])
			$bus['days'] = 1; 
			
			$anchorArray = array();
			for ($i = 0; $i <= 4; $i++) {
				if (array_key_exists('Anchor_'.$i, $row)){
					if ($row['Anchor_'.$i]!= "")
					array_push($anchorArray,  stripslashes($row['Anchor_'.$i]));
				}
			}
			
			$bus["anchors"] = $anchorArray;
			array_push($questionArray, $bus);
		}//end while
		$result->free();
	}
	return $questionArray;
}//end getQuestions

//------------------Cookie functions------------------
//Returns 1 if cookies are valid, and regenerates cookie for security
//Returns 0 if no cookies, or cookie invalid and also deletes them
function checkCookie($remember){	
	if(isset($_COOKIE['n']) && isset($_COOKIE['e'])){
		$cookNonce = $_COOKIE['n'];
		$userEmail = $_COOKIE['e'];
		  
		//connect to database to check if nonce exists
		global $mysqli;
		$q = "SELECT `Nonce` FROM `Nonce_MHT` WHERE `Email` = '$userEmail'";
		$result = $mysqli->query($q);
		  
		//if nonce matches, return 1
		if ($result->num_rows == 1){ 		  
			$row = $result->fetch_assoc();
			  
			if ($cookNonce == $row['Nonce']){
				//Regenerate new cookie
				//createCookie($userEmail);
				return 1;
			}
		}
		
		//Invalid nonce, delete cookies
		date_default_timezone_set('America/Toronto');
		setcookie("e", "", time()-60*60*24*100, "/");
		setcookie("n", "", time()-60*60*24*100, "/");
		return 0;
	}
	else
	return 0;
}//end checkCookie

/*function checkCookie(){
	if(isset($_COOKIE['n']) && isset($_COOKIE['e'])){
		$cookNonce = $_COOKIE['n'];
		$userEmail = $_COOKIE['e'];
	  
		//connect to database to check if nonce exists
		global $mysqli;
		$q = "SELECT `Nonce` FROM `Nonce_MHT` WHERE `Email` = '$userEmail'";
		$result = $mysqli->query($q);
	  
		//if nonce exists, log user in
		if ($result->num_rows == 1){ 		  
			$row = $result->fetch_assoc();
		  //echo "This is crypt".crypt($cookNonce,$row['Nonce']);
		  //echo "This is nonce".$row['Nonce'];
		 if (crypt($cookNonce,$row['Nonce']) == $row['Nonce']){
			//Regenerate new cookie
		  	createCookie($userEmail);
		  	$myResponse = createResponse($userEmail);
		}
		else
		$myResponse['result'] = 3; //3 === Can't connect to database
		
		echo json_encode($myResponse);
		$result->free();
		exit();
	  }
	  else{
		//Invalid nonce, delete cookies
		date_default_timezone_set('America/Toronto');
		setcookie("e", "", time()-60*60*24*100, "/");
   		setcookie("n", "", time()-60*60*24*100, "/");
		
		$myResponse['result'] = 3; //3 === Can't connect to database
		echo json_encode($myResponse);
		$result->free();
		exit();
	  }
   }
   else{
   		//No cookies
		$myResponse['result'] = 3; //3 === Can't connect to database
		echo json_encode($myResponse);
		$result->free();
		exit();
   }
}//end checkCookie
*/

//Deletes any existing cookie for user in database, generates new one
function createCookie($userEmail, $length){
	global $mysqli;
	//Delete old nonce, generate new one
	$q = "DELETE FROM `Nonce_MHT` WHERE `Email` = '$userEmail'";
	$result = $mysqli->query($q);
	
	$nonce = uniqid($length.'_', true);
	//$hashedNonce = crypt($nonce);
	date_default_timezone_set('America/Toronto');
	$now = date(DATE_ISO8601);
	$q = "INSERT INTO `Nonce_MHT`(`Email`, `Nonce`, `Date`)
	VALUES ('$userEmail', '$nonce', '$now')";
	$result = $result && $mysqli->query($q);
	
	//setcookie("cookname", $_SESSION['userId'], time()+60*60*24*100, "/");
	date_default_timezone_set('America/Toronto');
	setcookie("n", $nonce, time()+60*60*24*100, "/");
	setcookie("e", $userEmail, time()+60*60*24*100, "/");
	return $result;
}//end createCookie

function deleteCookie($userEmail){
	global $mysqli;
	//Delete nonce from database
	$q = "DELETE FROM `Nonce_MHT` WHERE `Email` = '$userEmail'";
	$result = $mysqli->query($q);
	
	//Delete nonce from user client
	if(isset($_COOKIE['n']) && isset($_COOKIE['e'])){
		date_default_timezone_set('America/Toronto');
		setcookie("e", "", time()-60*60*24*100, "/");
		setcookie("n", "", time()-60*60*24*100, "/");
	}
	
	return $result;
}//end createCookie

//------------------Password reset functions------------------
function resetPassword($userEmail){

}

?>