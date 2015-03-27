<?php
session_start();
require_once("database.php");

$myResponse	= array();	 //Create array to return session data

$action = $_REQUEST['action'];
$clinicianID = $_REQUEST["clinicianID"];
$patientID = $_REQUEST["patientID"];
$settings = $_REQUEST['data'];
$sessionName = $_REQUEST['session'];

//$notes = stripslashes($notes);
//$notes = json_decode($notes);

//Action: Get session
if ($action == 'get'){
	global $mysqli;
	
	//Delete if session already exists
	$q = "SELECT * FROM `Sessions_MHT_timeline`
		WHERE `PatientID` = '$patientID'";
			
	if ($result = $mysqli->query($q)){		
		$row = $result->fetch_assoc();
		
		$myResponse['get'] = array('patientID' => $row['PatientID'],
					'data' => unserialize($row['Settings']));
		
		$myResponse['result'] = 1;	//Successful
		$result->free();
	}
	else{
		$myResponse['result'] = 0;	//Unsuccessful
		$myResponse['error'] = $stmt->error;	
	}			
			
}//end get session

//Action: Save new session
if ($action == 'new' || $action == 'save'){
	global $mysqli;
	
	date_default_timezone_set('America/Toronto');
	$date = date(DATE_ISO8601);
	
	/*TODO: For save new, what to do if session already exists?
		Save as - if user inputs a name already in use
		
	*/
	
	//Delete if session already exists
	$q = "DELETE FROM `Sessions_MHT_timeline` WHERE `PatientID` = '$patientID'";
	
	$mysqli->query($q);
	
	//Insert new session. Create prepared mysqli statement
	$q = "INSERT INTO `Sessions_MHT_timeline`(`PatientID`, `Date`, `Settings`) VALUES (?,?,?)";
	if ($stmt = $mysqli->prepare($q)){
		$stmt->bind_param('sssss', $patientID, "", $date, "", $settingsString );	// Bind our param as string
		
		//$sessionName = $settings['name'];	
		$settingsString = serialize($settings);
			
		if (!$stmt->execute()){
			$myResponse['result'] = 0;	//Unsuccessful
			$myResponse['error'] = $stmt->error;
		}
		else{
			$myResponse['result'] = 1;	//Successful
			//$myResponse['test'] = unserialize($settingsString);
		}
		$stmt->close();
	}
}//end save session


//Action: Delete session
else if ($action == 'delete'){
	global $mysqli;
	
	//Delete previous notes
	$q = "DELETE FROM `Sessions_MHT_timeline`
		WHERE `PatientID` = '$patientID'";
	
	if ($mysqli->query($q))
		$myResponse['result'] = 1;
	else{
		$myResponse['result'] = 0;	//Unsuccessful
		$myResponse['error'] = $stmt->error;
	}
}//end delete session

//Action: Rename session
else if ($action == 'rename'){
	
	$newSessionName = $settings['name'];
	
	global $mysqli;
	$q = "UPDATE `Sessions_MHT_timeline` SET `SessionName`= '$newSessionName'
		WHERE `PatientID` = '$patientID'";
	
	if ($mysqli->query($q))
		$myResponse['result'] = 1;
	else{
		$myResponse['result'] = 0;	//Unsuccessful
		$myResponse['error'] = $stmt->error;
	}
}//end delete session

echo json_encode($myResponse);
exit();
?>