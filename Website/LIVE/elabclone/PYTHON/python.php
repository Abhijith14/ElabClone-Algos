<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Elab Clone By Abhijith </title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js"></script>
    
    <link href="https://fonts.googleapis.com/css?family=Poppins:100,200,300,400,500,600,700,800,900" rel="stylesheet">

    <link rel="stylesheet" href="css/open-iconic-bootstrap.min.css">
    <link rel="stylesheet" href="css/animate.css">
    
    <link rel="stylesheet" href="css/owl.carousel.min.css">
    <link rel="stylesheet" href="css/owl.theme.default.min.css">
    <link rel="stylesheet" href="css/magnific-popup.css">

    <link rel="stylesheet" href="css/aos.css">

    <link rel="stylesheet" href="css/ionicons.min.css">
    
    <link rel="stylesheet" href="css/flaticon.css">
    <link rel="stylesheet" href="css/icomoon.css">
    <link rel="stylesheet" href="css/style.css">

    <!--===============================================================================================-->	
	<link rel="icon" type="image/png" href="tabledata/images/icons/favicon.ico"/>
<!--===============================================================================================-->
	<link rel="stylesheet" type="text/css" href="tabledata/vendor/bootstrap/css/bootstrap.min.css">
<!--===============================================================================================-->
	<link rel="stylesheet" type="text/css" href="tabledata/fonts/font-awesome-4.7.0/css/font-awesome.min.css">
<!--===============================================================================================-->
	<link rel="stylesheet" type="text/css" href="tabledata/vendor/animate/animate.css">
<!--===============================================================================================-->
	<link rel="stylesheet" type="text/css" href="tabledata/vendor/select2/select2.min.css">
<!--===============================================================================================-->
	<link rel="stylesheet" type="text/css" href="tabledata/vendor/perfect-scrollbar/perfect-scrollbar.css">
<!--===============================================================================================-->
	<link rel="stylesheet" type="text/css" href="tabledata/css/util.css">

<!--===============================================================================================-->


  </head>
  <body data-spy="scroll" data-target=".site-navbar-target" data-offset="300">
	  
	  
    <nav class="navbar navbar-expand-lg navbar-dark ftco_navbar ftco-navbar-light site-navbar-target" id="ftco-navbar">
	    <div class="container">
	      <a class="navbar-brand" href="../index.php" style="color: black;"><span style="color: black;">Elab-</span>Clone</a>
	      <button class="navbar-toggler js-fh5co-nav-toggle fh5co-nav-toggle" type="button" data-toggle="collapse" data-target="#ftco-nav" aria-controls="ftco-nav" aria-expanded="false" aria-label="Toggle navigation">
	        <span class="oi oi-menu"></span> Menu
	      </button>

	      <div class="collapse navbar-collapse" id="ftco-nav">
	        <ul class="navbar-nav nav ml-auto">
	          <li class="nav-item"><a href="../index.php" class="nav-link"><span style="color: black;">Home</span></a></li>
	          <li class="nav-item"><a href="https://buddywebdeveloper.herokuapp.com/" class="nav-link" target="_blank"><span style="color: black;">Visit Buddy</span></a></li>
	          <li class="nav-item"><a href="https://buddywebdeveloper.herokuapp.com/contact.html" class="nav-link" target="_blank"><span style="color: black;">Contact</span></a></li>
	        </ul>
	      </div>
	    </div>
	  </nav>
	  <section>
	  	<br>
	  <br>
	  <br>
	  	<div class="container">
	  		<div class="row">
	  			 <div class="col-lg-11 col-lg-offset-4 mx-auto">
	  				<input type="text" id="search" class="form-control" placeholder="Search For The Question or the Session">
	  			</div>
	  		</div>
	  		<br>
			<div class="card">
				<div class="table-responsive">
				   <table class="table table-striped">
					<thead>
					  <tr style="background-color:#647bdf; color: white;">
						<th>Qno.</th>
						<th>Session</th>
						<th>Qname</th>
					  </tr>
					</thead>
					<tbody>
								<?php 
								$url = parse_url(getenv("CLEARDB_DATABASE_URL"));

								$server = $url["host"];
								$username = $url["user"];
								$password = $url["pass"];
								$db = substr($url["path"], 1);

								$conn = new mysqli($server, $username, $password, $db);

								if ($conn-> connect_error) {
									die("Coneection Failed:".$conn-> connect_error);
								}
								$sql = "SELECT id, SESSION, QUESTION_NO, QUESTION_NAME, QUESTION_DESC FROM elabdata";
								$result = $conn-> query($sql);
								if ($result-> num_rows > 0) {
									while ($row = $result-> fetch_assoc()) {  ?>
											<tr>
												<td>
													<a class="btn" href = "data.php?rowid=<?php echo $row['id']; ?>">
																Q. <?php echo $row['id'] ?>:
													</a>
												</td>
												<td>
													<a class="btn" href = "data.php?rowid=<?php echo $row['id']; ?>">
																<?php echo $row['SESSION'] ?>
													</a>
												</td>
												<td>
													<a class="btn" href = "data.php?rowid=<?php echo $row['id']; ?>">
																<?php echo $row['QUESTION_NAME'] ?>
													</a>
												</td>
											</tr>
											<?php
									}
								} ?>
								<tr class='notfound' style="display: none;">
									<td colspan='4'>No record found</td>
								</tr>
							</tbody>
				  </table>
				</div>  
			</div>
		</div>

	  </section>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
	  </section>
		

    <footer class="ftco-footer ftco-section">
      <div class="container">
        <div class="row mb-5">
          <div class="col-md">
            <div class="ftco-footer-widget mb-4">
              <h2 class="ftco-heading-2">About</h2>
              <p>The best way to predict the future is to invent it.</p>
              <ul class="ftco-footer-social list-unstyled float-md-left float-lft mt-5">
                <li class="ftco-animate"><a href="#"><span class="icon-twitter"></span></a></li>
                <li class="ftco-animate"><a href="#"><span class="icon-facebook"></span></a></li>
                <li class="ftco-animate"><a href="#"><span class="icon-instagram"></span></a></li>
              </ul>
            </div>
          </div>
          <div class="col-md">
            <div class="ftco-footer-widget mb-4 ml-md-4">
              <h2 class="ftco-heading-2">Links</h2>
              <ul class="list-unstyled">
                <li><a href="#"><span class="icon-long-arrow-right mr-2"></span>Home</a></li>
                <li><a href="#"><span class="icon-long-arrow-right mr-2"></span>About Us</a></li>
                <li><a href="#"><span class="icon-long-arrow-right mr-2"></span>Services</a></li>
                <li><a href="#"><span class="icon-long-arrow-right mr-2"></span>Contact</a></li>
              </ul>
            </div>
          </div>
          <div class="col-md">
             <div class="ftco-footer-widget mb-4">
              <h2 class="ftco-heading-2">Services</h2>
              <ul class="list-unstyled">
                <li><a href="#"><span class="icon-long-arrow-right mr-2"></span>Web Design</a></li>
                <li><a href="#"><span class="icon-long-arrow-right mr-2"></span>Web Development</a></li>
                <li><a href="#"><span class="icon-long-arrow-right mr-2"></span>Android App Development</a></li>
                <li><a href="#"><span class="icon-long-arrow-right mr-2"></span>Software Development</a></li>
              </ul>
            </div>
          </div>
          <div class="col-md">
            <div class="ftco-footer-widget mb-4">
            	<h2 class="ftco-heading-2">Have a Questions?</h2>
            	<div class="block-23 mb-3">
	              <ul>
	                <li><a href="#"><span class="icon icon-phone"></span><span class="text">+919946883500</span></a></li>
	                <li><a href="#"><span class="icon icon-envelope"></span><span class="text">abhijithukzm@gmail.com</span></a></li>
	              </ul>
	            </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12 text-center">

            <p><!-- Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. -->
  Copyright &copy;<script>document.write(new Date().getFullYear());</script> All rights reserved | Created and Developed by <a href="">Abhijith Udayakumar</a>
  <!-- Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. --></p>
          </div>
        </div>
      </div>
    </footer>
    
  

  <!-- loader -->
  <div id="ftco-loader" class="show fullscreen"><svg class="circular" width="48px" height="48px"><circle class="path-bg" cx="24" cy="24" r="22" fill="none" stroke-width="4" stroke="#eeeeee"/><circle class="path" cx="24" cy="24" r="22" fill="none" stroke-width="4" stroke-miterlimit="10" stroke="#F96D00"/></svg></div>




  <script src="js/jquery.min.js"></script>
  <script src="js/jquery-migrate-3.0.1.min.js"></script>
  <script src="js/popper.min.js"></script>
  <script src="js/bootstrap.min.js"></script>
  <script src="js/jquery.easing.1.3.js"></script>
  <script src="js/jquery.waypoints.min.js"></script>
  <script src="js/jquery.stellar.min.js"></script>
  <script src="js/owl.carousel.min.js"></script>
  <script src="js/jquery.magnific-popup.min.js"></script>
  <script src="js/aos.js"></script>
  <script src="js/jquery.animateNumber.min.js"></script>
  <script src="js/scrollax.min.js"></script>
  
  <script src="js/main.js"></script>
    <!--===============================================================================================-->	
    <script>
    	$(document).ready(function(){
    		$('#search').keyup(function(){
	    	    var searchK = $(this).val();
	    	    $('table tbody tr').hide();

			    var len = $('table tbody tr:not(.notfound) td:contains("'+searchK+'")').length;

			    if(len > 0){
	      
	      			$('table tbody tr:not(.notfound) td:contains("'+searchK+'")').each(function(){
	        			$(this).closest('tr').show();
	      			});
			    }
			    else{
			      $('.notfound').show();
			    }
 			 });

	});
    $.expr[":"].contains = $.expr.createPseudo(function(arg) {
  		 return function( elem ) {
     		return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
   		};
	});
  </script>

  </body>
</html>