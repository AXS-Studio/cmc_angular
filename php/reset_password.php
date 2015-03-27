<?php
/**
 * reset_password.php
 * script for sending automated password retrival email
 * called from Reset Password page
 */
session_start();
require_once("database.php");
require_once("password_hash.php");
require_once('functions.php');
require_once('EmailText.php');

define("PASSWORD_EXPIRY_MINUTES", 30);

//------------------On submission of reset password form------------------
//Return values
//1 === Success
//2 === Nonce invalid: Not found or expired
//3 === Can't connect to database

//$queryString = $_SERVER['QUERY_STRING'];
//$queryString2 = $_SERVER['REQUEST_URI'];

//Get POST password variable
//And GUID passed in the URL
$userNonce = $_REQUEST['n'];
$userPassword = $_REQUEST['Password'];
$userID = $_REQUEST['patientID'];

$myResponse['n'] = $userNonce;
$myResponse['pass'] = $userPassword;

global $mysqli;

//check if in-App reset
//$myResponse['hash'] = create_hash("inAppReset");

if (validate_password("inAppReset", $userNonce)){

	$hashedPassword = create_hash($userPassword);

	$q = "UPDATE `Patient` SET `Password`='$hashedPassword' WHERE `MedicalRecordNum` = '$userID'";
	
	if ($mysqli->query($q)){
		
		//Get FirstName for to send email confirmation and Email to delete cookies
		$q = "SELECT `FirstName`, `Email` FROM `Patient` WHERE `MedicalRecordNum` = '$userID'";
		$result = $mysqli->query($q);
		
		$row = $result->fetch_assoc();
		$firstName = $row['FirstName'];
		$userEmail = $row['Email'];
		$result->free();
		
 		deleteCookie($userEmail);

		//Send email to user
		$to = $dbEmail;
		$subject = EmailText::getSubject();		
		$body = EmailText::getText(EmailText::RESET_PASSWORD, array('FirstName' => $firstName));
		$headers = EmailText::getHeader();
		mail($to, $subject, $body, $headers);

		$myResponse['result'] = 1; //1 === Success
		logMHTActivity($dbEmail, "Completed in-app password reset");
		echo json_encode($myResponse);
		exit;
	}
	else{
		$myResponse['result'] = 3; //3 === Prepared query fail
		logMHTActivity($dbEmail, "reset_password.php: Database query fail");
		echo json_encode($myResponse);
		exit;
	}
}

//NOT in-App reset
//connect to database to check if nonce exists
if ($stmt = $mysqli->prepare("SELECT `Nonce`,`Email`,`Date` FROM `Nonce_MHT` WHERE `Nonce` = ?"))
{
	$stmt->bind_param('s', $userNonce);	//Bind our param as string
	$stmt->execute();					//Execute the prepared Statement
	$stmt->bind_result($dbNonce, $dbEmail, $dbDate); 	//Bind result
	$stmt->fetch();
	if (empty($dbEmail)){
		$stmt->close();	// Close the statement
		$myResponse['result'] = 2; //2 === Nonce not found
		logMHTActivity("none", "Could not complete password reset, nonce not found");
		echo json_encode($myResponse);
		exit();
	}
	else {
		//Nonce found
		$stmt->close();
		
		//Delete nonce from database
		$q = "DELETE FROM `Nonce_MHT` WHERE `Email` = '$dbEmail'";
		$result = $mysqli->query($q);
			
		//Check expiry
		date_default_timezone_set('America/Toronto');
		$secondsAgo = time()-strtotime($dbDate);
		//if ($secondsAgo < (60*PASSWORD_EXPIRY_MINUTES)){
			//Within expiry time, allow user to reset password
			$hashedPassword = create_hash($userPassword);
			$q = "UPDATE `Patient` SET `Password`='$hashedPassword'
			WHERE `Email` = '$dbEmail'";
			$result = $mysqli->query($q);
			
			$q = "SELECT `FirstName` FROM `Patient` WHERE `Email` = '$dbEmail'";
			$result = $mysqli->query($q);
			$row = $result->fetch_assoc();
			$firstName = $row['FirstName'];
			$result->free();
			
			//Send email to user
			$to = $dbEmail;
			$subject = EmailText::getSubject();		
			$body = EmailText::getText(EmailText::RESET_PASSWORD, array('FirstName' => $firstName));
			$headers = EmailText::getHeader();
			mail($to, $subject, $body, $headers);
			
			$myResponse['result'] = 1; //1 === Success
			logMHTActivity($dbEmail, "Completed password reset: Amount of seconds ".$secondsAgo);
			echo json_encode($myResponse);
			exit;
		//}
		//else{
			//Nonce expired, reject reset request
			// $myResponse['result'] = 2; //2 === Nonce expired
			// logMHTActivity($dbEmail, "Could not complete password reset, nonce expired");
			// echo json_encode($myResponse);
			// exit;
		//}
	}//end nonce found
}//end prepared query
else{
	$myResponse['result'] = 3; //3 === Prepared query fail
	logMHTActivity($dbEmail, "reset_password.php: Database query fail");
	echo json_encode($myResponse);
	exit;
}
?>