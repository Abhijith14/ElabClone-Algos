<?php

$id = $_GET['QID'];


#echo $id;
$url = parse_url(getenv("CLEARDB_DATABASE_URL"));

$server = $url["host"];
$username = $url["user"];
$password = $url["pass"];
$db = substr($url["path"], 1);

$conn = new mysqli($server, $username, $password, $db);

if ($conn-> connect_error) {
	die("Coneection Failed:".$conn-> connect_error);
}
$sql = "SELECT min(id) FROM elabdata";
$result = $conn-> query($sql);
if ($result-> num_rows > 0) {
	while ($row = $result-> fetch_assoc()) { 
		$low = $row['min(id)'];
	}
}


if ($low == $id){
	header("Location: python.php");
}
else{
	$id--;
	#echo $id;
	header("Location: data.php?rowid=$id");
}

?>