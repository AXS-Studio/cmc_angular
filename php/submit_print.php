<?php
session_start();
require_once("password_hash.php");
require_once("PHPMailer/PHPMailerAutoload.php");


//------------------Send PDF functionality from menu-ui.js------------------
//Steps
//1. Receive raw html
//2. Create temporary page locally
//3. Run page in phantomjs to create screencapture
//4. Send back to client

//Exit if error (for sendEmail=false)
function exitWithError($errorMessage){

	echo '<script>';
	echo 'alert('.'"Save PDF '.$errorMessage.'"'.')'.';';
	echo 'location.href="../index.php"'.';';
	echo '</script>';
	exit;
}

//Exit with JSON response if error (for sendEmail=true)
function exitWithErrorJSON($errorMessage){
	$myResponse['error'] = "Email PDF Error - Please contact pathadmin@sunnybrook.ca. ".$errorMessage;
 	echo json_encode($myResponse);
	exit;
}

//-----Obtain raw html---------------------------------------------------------------
$html = $_POST["html"];
$userEmail = $_POST["userEmail"];
$sendEmail = $_POST["sendEmail"];
$windowWidth = $_POST["width"];
$windowHeight = $_POST["height"];

if ($sendEmail == "false")
$sendEmail = false;
else if ($sendEmail == "true")
$sendEmail = true;

//For testing
// $html = "Hello World";
// $userEmail = "Michael.Kent@axs3d.com";
// $sendEmail = true;

if (!isset($html) || !isset($userEmail) || !isset($sendEmail)){
	//echo var_dump($_POST); //FOR DEBUG

	if ($sendEmail)
	exitWithErrorJSON("Missing data");
	else
	exitWithError("Error - Missing data currently debug. Please contact pathadmin@sunnybrook.ca" );
}

//-----Authenticate user via hashed cookie of email (michael.kent@axs3d.com)---------------------
$cookie = $_COOKIE['OUTPUTSESSID'];

if (!isset($cookie) || empty($cookie)) {

	if ($sendEmail)
	exitWithErrorJSON("Unauthorized");
	else
  	exitWithError("Error - Unauthorized.");
}
else if (!(validate_password($userEmail, $cookie))){

	if ($sendEmail)
	exitWithErrorJSON("Unauthorized");
	else
 	exitWithError("Error - Unauthorized");
}

//-----Create html page locally---------------------------------------------------------------
//$filepath= $_SERVER['DOCUMENT_ROOT']."/path/database";

$completeFilePath = $_SERVER['DOCUMENT_ROOT']."/mht/php/screenshots/"; //use on public server
$relativeFilePath = "screenshots/"; //Use in localhost (eg. MAMP)
$filename = uniqid('graph_', false); 
$file = $relativeFilePath.$filename;
//str_replace('.', '_',uniqid())

if (!$handle = fopen($file.'.html', 'w')) { 
	if ($sendEmail)
	exitWithErrorJSON("Cannot open file ($filename) ".error_get_last());
	else
	exitWithError("ERROR - Cannot open file ($filename). Please contact pathadmin@sunnybrook.ca ".error_get_last()); 
} 
if (fwrite($handle, $html) === false) {
	if ($sendEmail)
	exitWithErrorJSON("Cannot write to file ($filename) ".error_get_last());
	else
	exitWithError("ERROR - Cannot write to file ($filename). Please contact pathadmin@sunnybrook.ca ".error_get_last()); 
}

fclose($handle);

//-----Run phantomJS and ImageMagick Convert shell script to render PDF-----------------------
//session_write_close();

//Run phantomJS to screenshot local html page into png
//Cannot use phantomjs from bin (built for windows/OSX), must install linux version of phantomjs into server
$command = "sudo /usr/bin/phantomjs bin/rasterize.js ".$file.".html ".$file.".pdf '".$windowWidth/72.0."in*".$windowHeight/72.0."in' 2>&1 1> /dev/null"; //server version
//$command = "bin/phantomjs bin/rasterize.js ".$file.".html ".$file.".pdf '8.5in*11in' 2>&1 1> /dev/null"; //localhost version
$output = shell_exec($command);

//Check if file is a regular file
if ( !is_file($file.".pdf")){
	if ($sendEmail)
	exitWithErrorJSON("Cannot write to file ($filename)");
	else
	exitWithError("ERROR - rasterizing ".$output.error_get_last()); 
}

//if sendEmail, send file as email and return JSON response
if ($sendEmail){

  	$mail = new PHPMailer;

	$mail->From = 'pathadmin@sunnybrook.ca';
	$mail->FromName = 'MHTV';
	$mail->addAddress($userEmail);     // Add a recipient
	//$mail->addAddress('cindy.lau@axs3d.com');     // Add a recipient
	$mail->addReplyTo('pathadmin@sunnybrook.ca');
	
	$mail->addAttachment($file.".pdf");         // Add attachments
	//$mail->isHTML(true);                      // Set email format to HTML

	$mail->Subject = 'MHTV Printout';
	$mail->Body    = 'Printout from MHTV';
	//$mail->AltBody = 'This is the body in plain text for non-HTML mail clients';

	if(!$mail->send()) {
	    if ($sendEmail)
		exitWithErrorJSON("Email could not be sent");
		else
	    exitWithError("ERROR - Email could not be sent. Please contact pathadmin@sunnybrook.ca ".$mail->ErrorInfo); 
	} else {
	    $myResponse['result'] = "Email sucessfully sent";
	 	echo json_encode($myResponse);

	 	//Delete files afterward
		unlink($file.'.pdf');
		unlink($file.'.png');
		unlink($file.'.html');
		exit;
	}

}
else if (!$sendEmail){
	//-----Return pdf file to client---------------------------------------------------------------
	header('Content-type: application/pdf');
	header('Content-Disposition: attachment; filename="MHTV_graphs.pdf"');
	readfile( $file.".pdf");

	//---if returning images---
	//header('Content-type: image/jpg');
	//header('Content-Disposition: attachment; filename="downloaded.jpg"');
	//readfile('screenshots/test.jpg');
	//-------------
	//echo file_get_contents('test.pdf');

	//-----Delete temporary files afterwards---------------------------------------------------------------
	//Case for if user cancels file download
	ignore_user_abort(true);
	if (connection_aborted()) {
	unlink($file.'.pdf');
	unlink($file.'.png');
	unlink($file.'.html');
	}
	//Case for normal download
	unlink($file.'.pdf');
	unlink($file.'.png');
	unlink($file.'.html');
}

exit;

//Exit here for now
// $myResponse['result'] = "success with file creation";
// echo json_encode($myResponse);
// exit;

?>