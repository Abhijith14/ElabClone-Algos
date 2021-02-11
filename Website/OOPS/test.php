<?php

$id = 2;//$_GET['rowid'];

$CODE = "";

$TEST = '#include&lt;iostream&gt;using namespace std;int main(){int a,b,c;cin&gt&gta&gt&gtb;c = (a+b)/2;cout&lt;&lt;"I am "&lt;&lt;a&lt;&lt;endl;cout&lt;&lt;"You are "&lt;&lt;b&lt;&lt;endl;cout&lt;&lt;"We are around "&lt;&lt;c&lt;&lt;endl;return 0;}';

$conn = mysqli_connect("localhost","root","","oops");
if ($conn-> connect_error) {
  die("Coneection Failed:".$conn-> connect_error);
}
  $sqldata = "SELECT id, CODE FROM elabdata WHERE id=$id";
  $result = $conn-> query($sqldata);
  if ($result-> num_rows > 0) {
    while ($row = $result-> fetch_assoc()) {
     // echo $row['CODE'];
      echo $TEST;
    }
  }


?>