<?php
require_once("functions.php");

//------------------On click of start survey button------------------

$userID = $_REQUEST['patientID'];
$userEmail = $_REQUEST['patientEmail'];

$myResponse = createResponse($userEmail);
	
echo json_encode($myResponse);
exit();

?>