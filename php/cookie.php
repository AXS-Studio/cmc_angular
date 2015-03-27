<?php
require_once("functions.php");

//Checks cookie if set, and authenticates
if(isset($_COOKIE['n']) && isset($_COOKIE['e'])){
	$cookNonce = $_COOKIE['n'];
	$userEmail = $_COOKIE['e'];
	  
	//echo "This is email ".$userEmail.'<br>';
	//echo "This is nonce ".$cookNonce.'<br>';
	  
	//Connect to database to check if nonce exists
	global $mysqli;
	$q = "SELECT `Nonce` FROM `Nonce_MHT` WHERE `Email` = '$userEmail'";
	$result = $mysqli->query($q);
	
	//echo "This is num_rows ".$result->num_rows.'<br>';
	//If nonce exists, log user in
	if ($result->num_rows == 1)
	{ 		 
		$row = $result->fetch_assoc();
		// echo "This is crypt".crypt($cookNonce,$row['Nonce']);
	  	//echo "This is nonce".$row['Nonce'];
	 	if (crypt($cookNonce,$row['Nonce']) == $row['Nonce'])
		{
			//Regenerate new cookie
			createCookie($userEmail); //returns true if cookie successfully created
			$myResponse = createResponse($userEmail);
		}
		else
		$myResponse['result'] = 2; //2 === Can't connect
	}
	else
	{
		//Invalid nonce, delete cookies
		setcookie("e", "", time()-60*60*24*100, "/");
		setcookie("n", "", time()-60*60*24*100, "/");
		
		$myResponse['result'] = 2; //2 === Can't connect
	}
	$result->free();
}
else{
		//No cookies
		$myResponse['result'] = 2; //2 === Can't connect		
}
echo json_encode($myResponse);
$mysqli->close();
exit();
?>