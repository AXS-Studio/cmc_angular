<?php
session_start();
require_once("database.php");
global $mysqli;

$patientID		=	$_REQUEST["patientID"];
$tags = array();
$q = "SELECT DISTINCT(`Tag`) FROM `Tags` WHERE PatientID='$patientID'";
if ($result = $mysqli->query($q)){	
	while($row = $result->fetch_assoc()){
		$jsonArray[] = $row['Tag'];
	}//end while
	$result->free();
}
else{
	$jsonArray["error"] = 'Database error: '.$mysqli->error;;
}

echo json_encode($jsonArray);
exit();

?>