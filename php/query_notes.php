<?php
session_start();
require_once("database.php");

$myResponse	= array();	 //Create array to return session data

$nextID = $_REQUEST["nextID"];
$patientID = $_REQUEST["patientID"];
$notes = $_REQUEST['notes'];
//$notes = stripslashes($notes);
//$notes = json_decode($notes);
$myResponse['result'] = 0;	//Initialize JSON response

//Exit if required information not set
if (!isset($nextID) || !isset($patientID) || !isset($notes))
echo json_encode($myResponse);
exit();

global $mysqli;
//Delete previous notes
$q = "DELETE FROM `ClinicianNotes` WHERE `PatientID` = '$patientID'";
$result = $mysqli->query($q);
	
//Create prepared mysqli statement
$q = "INSERT INTO `ClinicianNotes`(`noteID`, `patientID`, `clinicianID`, `date`, `data`, `nextID`) VALUES (?,?,?,?,?,?)";
if ($stmt = $mysqli->prepare($q)){

	$stmt->bind_param('sssssi', $noteID, $patientID, $clinicianID, $date, $data, $nextID );	// Bind our param as string

	//Iterate through Answer array, and write to database
	for ($i = 0; $i < sizeof($notes); $i++){
		//Read in data from decoded JSON string
		$clinicianID = $notes[$i]['clinicianID'];//"clinicianID":"dkreindler"
		$noteID = $notes[$i]['noteID'];			//"noteID": "Record09_dkreindler_0"
		$rawDate = $notes[$i]['Date'];			//"Date": "Tue Apr 09 2013 23:39:19 GMT-0400 (Eastern Daylight Time)"
		$data = $notes[$i]['data'];
		
		//convert $date to php date object
		date_default_timezone_set('America/Toronto');
		
		$parts = explode(" (",$rawDate); //break the string up around the " (" character in $rawDate
		$rawDate = $parts['0'];
		$date = date(DATE_ISO8601,strtotime($rawDate));
		
		if (!$stmt->execute())
	 	$myResponse['error'] = $stmt->error;
		else
		$myResponse['result'] = 1;	//Successful
	}//end for loop
	$stmt->close();
	
}//end if statement

echo json_encode($myResponse);
?>