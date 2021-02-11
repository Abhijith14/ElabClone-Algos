<?php

$id = $_GET['QID'];


#echo $id;
$host = "ec2-23-20-70-32.compute-1.amazonaws.com";
                $user = "qdolfiocvnulss";
                $pass = "bd798a618db89d9025f68f795b68a20f87ae9e3a012cd4004369d6daa91299dd";
                $dbname = "davups0o4matv3";
                $port = "5432";
$conn = pg_connect("host=$host dbname=$dbname user=$user password=$pass port=$port")
                          or die ("Could not connect to server\n"); 


$sql = 'SELECT MIN(id) FROM elabdata';

$result = pg_query($conn, $sql) or die("Cannot execute query: $query\n");
if (pg_num_rows($result) > 0) {
	while ($row = pg_fetch_assoc($result)) { 
		$low = $row['min'];
	}
}

#echo $low;

if ($low == $id){
	header("Location: Java.php");
}
else{
	$id--;
	#echo $id;
	header("Location: data.php?rowid=$id");
}

?>