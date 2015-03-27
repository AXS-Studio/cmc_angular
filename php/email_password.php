<?php
/**
 * email_password.php
 * script for sending automated password retrival email
 * called from Forgot Password page
 */
session_start();
require_once("database.php");
require_once("password_hash.php");
require_once('EmailText.php');

//------------------On submission of forgot password form------------------
//Return values
//1 === Success
//2 === Email not found
//3 === Can't connect to database

 
//Get POST email variable
$userEmail = $_REQUEST['Email'];

//Send email to that account with a unique url which expires
global $mysqli;
if ($stmt = $mysqli->prepare("SELECT `FirstName` FROM `Patient` WHERE `Email` = ?"))
{
	$stmt->bind_param('s', $userEmail);	//Bind our param as string
	$stmt->execute();					//Execute the prepared Statement
	$stmt->bind_result($dbFirstName); 	//Bind result
	$stmt->fetch();
	if (empty($dbFirstName)){
		$stmt->close();	// Close the statement
		$myResponse['result'] = 2; //2 === Username/Email not found
		echo json_encode($myResponse);
		exit();
	}
	else{
		//Email found in database
		$stmt->close();	// Close the statement
		
		//Delete old nonces if they exist
		$q = "DELETE FROM `Nonce_MHT` WHERE `Email` = '$userEmail'";
		$result = $mysqli->query($q);
		
		//Generate new nonce and update database
		//$randomNonce = generatePassword(5);
		//$hashedNonce = create_hash($randomNonce);
		$randomNonce = uniqid();
		date_default_timezone_set('America/Toronto');
		$now = date(DATE_ISO8601);
		$q = "INSERT INTO `Nonce_MHT`(`Email`, `Nonce`, `Date`) VALUES ('$userEmail','$randomNonce','$now')";
		
		if ($result = $mysqli->query($q)){
			//Send email to user with URL containing unique nonce
			//This nonce will be used to identify user in reset password page
			$to = $userEmail;
		
			$subject = EmailText::getSubject();
			$body = EmailText::getText(EmailText::EMAIL_PASSWORD, array( 'FirstName' => $dbFirstName, 'Nonce' => $randomNonce ));
			//$body = "Hello ,\n\nTo reset your password, please visit the following link: http://www.google.com\n\nIf you were not trying to reset your password, don't worry. Your current password is still secure. It cannot be changed unless you access the link above and enter a new one.\n\nSincerely,\nMHTVP System Administrator";
	
			$headers = EmailText::getHeader();
			
			$mailResult = mail($to, $subject, $body, $headers);
			$myResponse['to'] = $to;
			$myResponse['firstName'] = $dbFirstName;
			$myResponse['body'] = $body;
			$myResponse['mail'] = $mailResult;
			$myResponse['result'] = 1; //1 === Success
			
			logMHTActivity($userEmail, "Submitted password reset");
			
			echo json_encode($myResponse);
			exit;
		}//end send email upon sucessful insert
	}//end email found in database
}//end prepared query

	$myResponse['result'] = 3; //3 === Database call error
	echo json_encode($myResponse);
	exit;
?>