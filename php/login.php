<?php
require_once("functions.php");

//------------------On submission of login form------------------
//Return values for 'result'
//0 === Database error
//1 === Success
//2 === Wrong password
//3 === Wrong username
//4 === User not enabled

$userEmail = $_REQUEST['userId'];
$password = $_REQUEST['password'];
$remember = $_REQUEST['remember'];

//For Cindy's debugging only
//$userEmail = 'Cindy.Lau@axs3d.com';
//$password='password';
//checkCookie();
//$result = 999;
$result = confirmUser($userEmail, $password, $remember);

// Check error codes (1: username error, 2: password error)
if($result == 0){
	$myResponse['result'] = 0; //0 === Can't connect to database
	echo json_encode($myResponse);
	exit();
}
else if($result == 2){
	$myResponse['result'] = 2; //2 === Wrong password
	echo json_encode($myResponse);
	exit();
}
else if($result == 3){
	$myResponse['result'] = 3; //3 === Wrong user name
	echo json_encode($myResponse);
	exit();
}
else if($result == 4){
	$myResponse['result'] = 4; //4 === User not enabled
	echo json_encode($myResponse);
	exit();
}
else if($result == 1 ) {
	// Username and password correct, register session variables
	session_regenerate_id();
	//$_SESSION['userID'] = $userEmail;
	setcookie("OUTPUTSESSID", create_hash($userEmail), 0, "/");

	// http://stackoverflow.com/questions/9998900/maintain-php-session-in-web-app-on-iphone/14594908#14594908
	$cookieLifetime = 1 * 24 * 60 * 60; // A day in seconds
	setcookie(session_name(),session_id(),time()+$cookieLifetime);
	
	//Check if cookie option is set, expires in 100 days
	if ($remember == 'true'){
		$length = strlen($password);
		createCookie($userEmail, $length);
	}
	else if ($remember == 'false'){
		deleteCookie($userEmail);
	}
	
	//$myResponse = createResponse($userEmail); //instead of downloading all the questions and creating a new questionnaire session during login...
	$myResponse = getPatientID($userEmail); //Now only return the PatientID for further use

	echo json_encode($myResponse);
	exit();
}
?>