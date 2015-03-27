<?php
/**
 * reset_password.php
 * script for sending automated password retrival email
 * called from Reset Password page
 */

//session_start();
//require_once("database.php");
//require_once("password_hash.php");
require_once('EmailText.php');
/*
//Send email to user
$to = $dbEmail;
$subject = EmailText::getSubject();		
//$body = "Hello $firstName!\n\nYour password has been reset.\n\nIf you received this email in error please contact your admin at Mental Health Telemetry.";
$body = EmailText::getText(EmailText::RESET_PASSWORD, array(
'FirstName' => $firstName));
$headers = EmailText::getHeader();

echo $to;
echo "<br>";
echo $subject;
echo "<br>";
echo $body;
echo "<br>";
echo $headers;
echo "<br>";
$result = mail($to, $subject, $body, $headers);
echo $result;


$to      = 'cyk.lau@gmail.com';
$subject = EmailText::getSubject();
$message = EmailText::getText(EmailText::RESET_PASSWORD, array('FirstName' => $firstName));
$headers = EmailText::getHeader();

mail($to, $subject, $message, $headers);

*/

//Send email to user
			$to = 'cyk.lau@gmail.com';
			$subject = EmailText::getSubject();		
			$body = EmailText::getText(EmailText::RESET_PASSWORD, array('FirstName' => $firstName));
			$headers = EmailText::getHeader();
			
			mail($to, $subject, $body, $headers);
?>