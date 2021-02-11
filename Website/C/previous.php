<?php

$id = $_GET['QID'];


#echo $id;

$conn = mysqli_connect("localhost","root","","c");
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
	header("Location: c.php");
}
else{
	$id--;
	#echo $id;
	header("Location: data.php?rowid=$id");
}

?>