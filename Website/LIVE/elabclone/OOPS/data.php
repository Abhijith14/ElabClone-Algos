
<?php

$id = $_GET['rowid'];

$session = "";
$QNO = "";
$QNAME = "";
$QNDESC = "";
$CODE = "";
$TCNO = []; 
$IP = [];
$OP = [];
$conn = mysqli_connect("localhost","root","","oops");
if ($conn-> connect_error) {
  die("Coneection Failed:".$conn-> connect_error);
}
  $sqldata = "SELECT id, SESSION, QUESTION_NO, QUESTION_NAME, QUESTION_DESC, CODE FROM elabdata WHERE id=$id";
  $result = $conn-> query($sqldata);
  if ($result-> num_rows > 0) {
    while ($row = $result-> fetch_assoc()) {
      $session = $row['SESSION'];
      $QNO = $row['QUESTION_NO'];
      $QNAME = $row['QUESTION_NAME'];
      $QNDESC = $row['QUESTION_DESC'];
      $CODE = $row['CODE'];
    }
  }

  $sqltest = "SELECT dataid, TESTCASE_NO, INPUT, OUTPUT FROM elabtestcase WHERE dataid=$id";
  $resulttest = $conn-> query($sqltest);
  if ($resulttest-> num_rows > 0) {
    $i = 0;
    while ($rowtest = $resulttest-> fetch_assoc()) {
      $TCNO[$i] = $rowtest['TESTCASE_NO'];
      $IP[$i] = $rowtest['INPUT'];
      $OP[$i] = $rowtest['OUTPUT'];
      $i++;
    }
  }

  //echo $QNDESC;
  $QNDESC = str_replace('(br)', '<br>', $QNDESC);
  $CODE = str_replace('(br)', '&#13;&#10;', $CODE);

?>




<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Elab Clone By Abhijith </title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    
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



<link rel="icon" type="image/x-icon" href="favicon.ico">
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk" crossorigin="anonymous">
<script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js" integrity="sha384-OgVRvuATP1z7JjHLkuOU7Xw704+h835Lr+6QL9UvYjZE3Ipu6Tp75j7Bh/kR0JKI" crossorigin="anonymous"></script>
<script type="text/javascript" src="http://cdnjs.cloudflare.com/ajax/libs/ace/1.2.8/ace.js"></script>
<style type="text/css">
    #jseditor {
       height: 450px;
    }
    .codeeditor {
    
}
  </style><!--  pointer-events: none; -->
<style>
  body {
      margin: 0;
      padding: 0;
    }
    .elab_container {
      width: 100vw;
      height: 100vh;
      background-color: #1565c0;
    }

    .elab_loader {
      width: 100%;
      padding-top: 20vh;
      text-align: center;
    }

    .elab_block {
      display: inline-block;
      text-align: center;
    }

    .elab_logo {
      font-size: 15px;
      font-family: "Roboto", "Helvetica Neue", Helvetica, Arial, sans-serif;
      color: #fafafa;
      letter-spacing: 4px;
      line-height: 15px;
    }

    .elab_loader_block .spinner {
      height: 60px;
      width: 60px;
      position: relative;
      display: inline-block;
      vertical-align: middle;
    }

    .elab_loader_block .spinner span {
      border-radius: 40px;
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      border: 3px solid white;
      opacity: 0;
      -webkit-animation: scale 3s ease-out infinite;
    }

    .elab_loader_block .spinner span:nth-child(2) {
      -webkit-animation-delay: 2s;
    }

    .elab_loader_block .spinner span:nth-child(3) {
      -webkit-animation-delay: 1s;
    }
    @-webkit-keyframes scale {
      0% {
        opacity: 0;
        -webkit-transform: scale(0);
      }
      70% {
        opacity: 1;
      }
      100% {
        opacity: 0;
        -webkit-transform: scale(1);
      }
    }</style>
  <style>
  .mat-toolbar-row,.mat-toolbar-single-row{display:flex;box-sizing:border-box;padding:0 16px;width:100%;flex-direction:row;align-items:center;white-space:nowrap}.mat-toolbar-multiple-rows{display:flex;box-sizing:border-box;flex-direction:column;width:100%}.mat-toolbar-multiple-rows{min-height:64px}.mat-toolbar-row,.mat-toolbar-single-row{height:64px}@media (max-width:599px){.mat-toolbar-multiple-rows{min-height:56px}.mat-toolbar-row,.mat-toolbar-single-row{height:56px}}
  </style>
  <style>.mat-divider{display:block;margin:0;border-top-width:1px;border-top-style:solid}.mat-divider.mat-divider-vertical{border-top:0;border-right-width:1px;border-right-style:solid}.mat-divider.mat-divider-inset{margin-left:80px}[dir=rtl] .mat-divider.mat-divider-inset{margin-left:auto;margin-right:80px}</style>
  <style>.mat-card{transition:box-shadow 280ms cubic-bezier(.4,0,.2,1);display:block;position:relative;padding:24px;border-radius:2px}.mat-card:not([class*=mat-elevation-z]){box-shadow:0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12)}.mat-card .mat-divider{position:absolute;left:0;width:100%}[dir=rtl] .mat-card .mat-divider{left:auto;right:0}.mat-card .mat-divider.mat-divider-inset{position:static;margin:0}@media screen and (-ms-high-contrast:active){.mat-card{outline:solid 1px}}.mat-card-flat{box-shadow:none}.mat-card-actions,.mat-card-content,.mat-card-subtitle,.mat-card-title{display:block;margin-bottom:16px}.mat-card-actions{margin-left:-16px;margin-right:-16px;padding:8px 0}.mat-card-actions-align-end{display:flex;justify-content:flex-end}.mat-card-image{width:calc(100% + 48px);margin:0 -24px 16px -24px}.mat-card-xl-image{width:240px;height:240px;margin:-8px}.mat-card-footer{display:block;margin:0 -24px -24px -24px}.mat-card-actions .mat-button,.mat-card-actions .mat-raised-button{margin:0 4px}.mat-card-header{display:flex;flex-direction:row}.mat-card-header-text{margin:0 8px}.mat-card-avatar{height:40px;width:40px;border-radius:50%;flex-shrink:0}.mat-card-lg-image,.mat-card-md-image,.mat-card-sm-image{margin:-8px 0}.mat-card-title-group{display:flex;justify-content:space-between;margin:0 -8px}.mat-card-sm-image{width:80px;height:80px}.mat-card-md-image{width:112px;height:112px}.mat-card-lg-image{width:152px;height:152px}@media (max-width:599px){.mat-card{padding:24px 16px}.mat-card-actions{margin-left:-8px;margin-right:-8px}.mat-card-image{width:calc(100% + 32px);margin:16px -16px}.mat-card-title-group{margin:0}.mat-card-xl-image{margin-left:0;margin-right:0}.mat-card-header{margin:-8px 0 0 0}.mat-card-footer{margin-left:-16px;margin-right:-16px}}.mat-card-content>:first-child,.mat-card>:first-child{margin-top:0}.mat-card-content>:last-child:not(.mat-card-footer),.mat-card>:last-child:not(.mat-card-footer){margin-bottom:0}.mat-card-image:first-child{margin-top:-24px}.mat-card>.mat-card-actions:last-child{margin-bottom:-16px;padding-bottom:0}.mat-card-actions .mat-button:first-child,.mat-card-actions .mat-raised-button:first-child{margin-left:0;margin-right:0}.mat-card-subtitle:not(:first-child),.mat-card-title:not(:first-child){margin-top:-4px}.mat-card-header .mat-card-subtitle:not(:first-child){margin-top:-8px}.mat-card>.mat-card-xl-image:first-child{margin-top:-8px}.mat-card>.mat-card-xl-image:last-child{margin-bottom:-8px}</style>
  <style>.mat-form-field{display:inline-block;position:relative;text-align:left}[dir=rtl] .mat-form-field{text-align:right}.mat-form-field-wrapper{position:relative}.mat-form-field-flex{display:inline-flex;align-items:baseline;width:100%}.mat-form-field-prefix,.mat-form-field-suffix{white-space:nowrap;flex:none}.mat-form-field-prefix .mat-icon,.mat-form-field-suffix .mat-icon{width:1em}.mat-form-field-prefix .mat-icon-button,.mat-form-field-suffix .mat-icon-button{font:inherit;vertical-align:baseline}.mat-form-field-prefix .mat-icon-button .mat-icon,.mat-form-field-suffix .mat-icon-button .mat-icon{font-size:inherit}.mat-form-field-infix{display:block;position:relative;flex:auto;min-width:0;width:180px}.mat-form-field-label-wrapper{position:absolute;left:0;box-sizing:content-box;width:100%;height:100%;overflow:hidden;pointer-events:none}.mat-form-field-label{position:absolute;left:0;font:inherit;pointer-events:none;width:100%;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;transform:perspective(100px);-ms-transform:none;transform-origin:0 0;transition:transform .4s cubic-bezier(.25,.8,.25,1),color .4s cubic-bezier(.25,.8,.25,1),width .4s cubic-bezier(.25,.8,.25,1);display:none}[dir=rtl] .mat-form-field-label{transform-origin:100% 0;left:auto;right:0}.mat-form-field-can-float.mat-form-field-should-float .mat-form-field-label,.mat-form-field-empty.mat-form-field-label{display:block}.mat-form-field-autofill-control:-webkit-autofill+.mat-form-field-label-wrapper .mat-form-field-label{display:none}.mat-form-field-can-float .mat-form-field-autofill-control:-webkit-autofill+.mat-form-field-label-wrapper .mat-form-field-label{display:block;transition:none}.mat-input-server:focus+.mat-form-field-placeholder-wrapper .mat-form-field-placeholder,.mat-input-server[placeholder]:not(:placeholder-shown)+.mat-form-field-placeholder-wrapper .mat-form-field-placeholder{display:none}.mat-form-field-can-float .mat-input-server:focus+.mat-form-field-placeholder-wrapper .mat-form-field-placeholder,.mat-form-field-can-float .mat-input-server[placeholder]:not(:placeholder-shown)+.mat-form-field-placeholder-wrapper .mat-form-field-placeholder{display:block}.mat-form-field-label:not(.mat-form-field-empty){transition:none}.mat-form-field-underline{position:absolute;height:1px;width:100%}.mat-form-field-disabled .mat-form-field-underline{background-position:0;background-color:transparent}.mat-form-field-underline .mat-form-field-ripple{position:absolute;top:0;left:0;width:100%;height:2px;transform-origin:50%;transform:scaleX(.5);visibility:hidden;opacity:0;transition:background-color .3s cubic-bezier(.55,0,.55,.2)}.mat-form-field-invalid:not(.mat-focused) .mat-form-field-underline .mat-form-field-ripple{height:1px}.mat-focused .mat-form-field-underline .mat-form-field-ripple,.mat-form-field-invalid .mat-form-field-underline .mat-form-field-ripple{visibility:visible;opacity:1;transform:scaleX(1);transition:transform .3s cubic-bezier(.25,.8,.25,1),opacity .1s cubic-bezier(.25,.8,.25,1),background-color .3s cubic-bezier(.25,.8,.25,1)}.mat-form-field-subscript-wrapper{position:absolute;width:100%;overflow:hidden}.mat-form-field-label-wrapper .mat-icon,.mat-form-field-subscript-wrapper .mat-icon{width:1em;height:1em;font-size:inherit;vertical-align:baseline}.mat-form-field-hint-wrapper{display:flex}.mat-form-field-hint-spacer{flex:1 0 1em}.mat-error{display:block}</style>
  <style>.mat-input-element{font:inherit;background:0 0;color:currentColor;border:none;outline:0;padding:0;margin:0;width:100%;max-width:100%;vertical-align:bottom;text-align:inherit}.mat-input-element:-moz-ui-invalid{box-shadow:none}.mat-input-element::-ms-clear,.mat-input-element::-ms-reveal{display:none}.mat-input-element[type=date]::after,.mat-input-element[type=datetime-local]::after,.mat-input-element[type=datetime]::after,.mat-input-element[type=month]::after,.mat-input-element[type=time]::after,.mat-input-element[type=week]::after{content:' ';white-space:pre;width:1px}.mat-input-element::placeholder{transition:color .4s .133s cubic-bezier(.25,.8,.25,1)}.mat-input-element::-moz-placeholder{transition:color .4s .133s cubic-bezier(.25,.8,.25,1)}.mat-input-element::-webkit-input-placeholder{transition:color .4s .133s cubic-bezier(.25,.8,.25,1)}.mat-input-element:-ms-input-placeholder{transition:color .4s .133s cubic-bezier(.25,.8,.25,1)}.mat-form-field-hide-placeholder .mat-input-element::placeholder{color:transparent!important;transition:none}.mat-form-field-hide-placeholder .mat-input-element::-moz-placeholder{color:transparent!important;transition:none}.mat-form-field-hide-placeholder .mat-input-element::-webkit-input-placeholder{color:transparent!important;transition:none}.mat-form-field-hide-placeholder .mat-input-element:-ms-input-placeholder{color:transparent!important;transition:none}textarea.mat-input-element{resize:vertical;overflow:auto}textarea.mat-autosize{resize:none}</style>
  <style>.container[_ngcontent-c10]{min-height:calc(100vh - 70px);-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center}mat-card[_ngcontent-c10]{width:calc(100vw - 50px);max-width:80vw;margin:10px}.row[_ngcontent-c10]{display:-webkit-box;display:-ms-flexbox;display:flex;-ms-flex-wrap:wrap;flex-wrap:wrap;-ms-flex-line-pack:justify;align-content:space-between}.col[_ngcontent-c10]{-webkit-box-flex:1;-ms-flex:1;flex:1;max-width:30%;min-width:320px;padding:15px}</style>
  <style>.mat-progress-spinner{display:block;position:relative}.mat-progress-spinner svg{position:absolute;transform:rotate(-90deg);top:0;left:0;transform-origin:center;overflow:visible}.mat-progress-spinner circle{fill:transparent;transform-origin:center;transition:stroke-dashoffset 225ms linear}.mat-progress-spinner.mat-progress-spinner-indeterminate-animation[mode=indeterminate]{animation:mat-progress-spinner-linear-rotate 2s linear infinite}.mat-progress-spinner.mat-progress-spinner-indeterminate-animation[mode=indeterminate] circle{transition-property:stroke;animation-duration:4s;animation-timing-function:cubic-bezier(.35,0,.25,1);animation-iteration-count:infinite}.mat-progress-spinner.mat-progress-spinner-indeterminate-fallback-animation[mode=indeterminate]{animation:mat-progress-spinner-stroke-rotate-fallback 10s cubic-bezier(.87,.03,.33,1) infinite}.mat-progress-spinner.mat-progress-spinner-indeterminate-fallback-animation[mode=indeterminate] circle{transition-property:stroke}@keyframes mat-progress-spinner-linear-rotate{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@keyframes mat-progress-spinner-stroke-rotate-100{0%{stroke-dashoffset:268.60617px;transform:rotate(0)}12.5%{stroke-dashoffset:56.54867px;transform:rotate(0)}12.5001%{stroke-dashoffset:56.54867px;transform:rotateX(180deg) rotate(72.5deg)}25%{stroke-dashoffset:268.60617px;transform:rotateX(180deg) rotate(72.5deg)}25.0001%{stroke-dashoffset:268.60617px;transform:rotate(270deg)}37.5%{stroke-dashoffset:56.54867px;transform:rotate(270deg)}37.5001%{stroke-dashoffset:56.54867px;transform:rotateX(180deg) rotate(161.5deg)}50%{stroke-dashoffset:268.60617px;transform:rotateX(180deg) rotate(161.5deg)}50.0001%{stroke-dashoffset:268.60617px;transform:rotate(180deg)}62.5%{stroke-dashoffset:56.54867px;transform:rotate(180deg)}62.5001%{stroke-dashoffset:56.54867px;transform:rotateX(180deg) rotate(251.5deg)}75%{stroke-dashoffset:268.60617px;transform:rotateX(180deg) rotate(251.5deg)}75.0001%{stroke-dashoffset:268.60617px;transform:rotate(90deg)}87.5%{stroke-dashoffset:56.54867px;transform:rotate(90deg)}87.5001%{stroke-dashoffset:56.54867px;transform:rotateX(180deg) rotate(341.5deg)}100%{stroke-dashoffset:268.60617px;transform:rotateX(180deg) rotate(341.5deg)}}@keyframes mat-progress-spinner-stroke-rotate-fallback{0%{transform:rotate(0)}25%{transform:rotate(1170deg)}50%{transform:rotate(2340deg)}75%{transform:rotate(3510deg)}100%{transform:rotate(4680deg)}}</style>
  <style>.mat-divider[_ngcontent-c11]{border-top-color:hsla(0,0%,100%,.12)!important}.ul[_ngcontent-c11]{padding-top:25px;-ms-flex-wrap:nowrap;flex-wrap:nowrap}.li[_ngcontent-c11], .ul[_ngcontent-c11]{display:-webkit-box;display:-ms-flexbox;display:flex}.li[_ngcontent-c11]{-webkit-box-flex:1;-ms-flex-positive:1;flex-grow:1;-ms-flex-negative:0;flex-shrink:0;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center}.title[_ngcontent-c11]{color:#bbdefb}.z-depth[_ngcontent-c11]:hover{-webkit-box-shadow:0 8px 8px 8px rgba(0,0,0,.2),0 8px 8px 0 rgba(0,0,0,.14),0 8px 8px 0 rgba(0,0,0,.12)!important;box-shadow:0 8px 8px 8px rgba(0,0,0,.2),0 8px 8px 0 rgba(0,0,0,.14),0 8px 8px 0 rgba(0,0,0,.12)!important;-webkit-transform:translateZ(0);transform:translateZ(0);-webkit-transition:background .4s cubic-bezier(.25,.8,.25,1),-webkit-box-shadow .28s cubic-bezier(.4,0,.2,1);transition:background .4s cubic-bezier(.25,.8,.25,1),-webkit-box-shadow .28s cubic-bezier(.4,0,.2,1);transition:background .4s cubic-bezier(.25,.8,.25,1),box-shadow .28s cubic-bezier(.4,0,.2,1);transition:background .4s cubic-bezier(.25,.8,.25,1),box-shadow .28s cubic-bezier(.4,0,.2,1),-webkit-box-shadow .28s cubic-bezier(.4,0,.2,1)}</style>
  <style>.container[_ngcontent-c13]{min-height:calc(100vh - 70px);-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center}mat-card[_ngcontent-c13]{width:calc(100vw - 50px);max-width:80vw;margin:10px}</style><style>text.jqx-chart-legend-text[_ngcontent-c14]{display:none!important}.jqx-tooltip[_ngcontent-c14]{margin-bottom:50px}a#courseName[_ngcontent-c14]{font-size:20px;font-family:Roboto,Helvetica Neue,Helvetica,Arial,sans-serif;-webkit-transform:translateX(-50%) translateY(-50%);transform:translateX(-50%) translateY(-50%);position:absolute;left:450px;top:515px;max-width:170px;text-align:center;font-weight:600;z-index:1}table[_ngcontent-c14]{width:100%;font-family:Roboto,Courier New,Courier,monospace}tr[_ngcontent-c14]{height:35px}.red[_ngcontent-c14]{background-color:#fa1717}.yellow[_ngcontent-c14]{background-color:#cddc39}.green[_ngcontent-c14]{background-color:#2a2}</style><style></style><style>.loader[_ngcontent-c16]{min-height:calc(80vh - 70px);-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center}mat-card.load[_ngcontent-c16]{width:720px;max-width:80vw;margin:10px}.outer[_ngcontent-c16]{display:block;max-width:100%}.container[_ngcontent-c16]{padding:0 20px 0 20px;display:-webkit-box;display:-ms-flexbox;display:flex}.question[_ngcontent-c16]{width:30%;margin-right:20px;padding:5px;max-height:calc(100vh - 70px);overflow:scroll}.solution[_ngcontent-c16]{width:65.5%}@media only screen and (max-width:768px){.container[_ngcontent-c16]{display:block}.question[_ngcontent-c16]{max-width:100%}.question[_ngcontent-c16], .solution[_ngcontent-c16]{width:100%}}.list[_ngcontent-c16]{margin-top:10px}.list-item[_ngcontent-c16]{padding:10px 0 10px 0;font-size:14px}.list-item[_ngcontent-c16]   a.title[_ngcontent-c16]{font-weight:700}mat-card[_ngcontent-c16]{padding-left:15px!important;padding-right:15px!important;padding-bottom:0!important}pre[_ngcontent-c16]{white-space:pre-wrap}code[_ngcontent-c16]{background:#d1dffa}.main-buttons[_ngcontent-c16]   button[_ngcontent-c16]{width:150px}div.result[_ngcontent-c16]{display:-webkit-box;display:-ms-flexbox;display:flex;-ms-flex-wrap:nowrap;flex-wrap:nowrap}a.result[_ngcontent-c16]{text-align:center;padding:20px;margin-top:0;color:#fff;border-radius:5px}.selector[_ngcontent-c16]{padding:0 20px 0 20px}.reportBtn[_ngcontent-c16]{margin:20px;font-weight:700;color:red;border:1px solid red;width:calc(100% - 40px)}.reportBtn[_ngcontent-c16]:hover{text-decoration:underline}.blocks[_ngcontent-c16]{display:-webkit-box;display:-ms-flexbox;display:flex;-ms-flex-wrap:wrap;flex-wrap:wrap;-ms-flex-line-pack:justify;align-content:space-between}.blocks[_ngcontent-c16]   div[_ngcontent-c16]{-webkit-box-flex:1;-ms-flex-positive:1;flex-grow:1;max-width:30%;margin:10px 10px;padding-top:15px;position:relative}.blocks[_ngcontent-c16]   div[_ngcontent-c16]   p[_ngcontent-c16]{margin:0;display:inline}.blocks[_ngcontent-c16]   div[_ngcontent-c16]   p.title[_ngcontent-c16]{font-size:13px;display:block;padding-bottom:5px;letter-spacing:1px}.blocks[_ngcontent-c16]   div[_ngcontent-c16]   p.status[_ngcontent-c16], .blocks[_ngcontent-c16]   div[_ngcontent-c16]   p.title[_ngcontent-c16]{margin-left:10px;text-transform:uppercase}.blocks[_ngcontent-c16]   div[_ngcontent-c16]   p.status[_ngcontent-c16]{font-size:16px;font-weight:700;color:#a1a1a1;padding-bottom:10px}.blocks[_ngcontent-c16]   div[_ngcontent-c16]   p.icon[_ngcontent-c16]{float:right;padding-bottom:5px;padding-right:15px}.red[_ngcontent-c16]{color:red}.green[_ngcontent-c16]{color:green}.blocks[_ngcontent-c16]   div[_ngcontent-c16]   p.line[_ngcontent-c16]{background-color:currentColor;content:" ";width:100%;display:block;height:4px;position:absolute;bottom:0}</style>
  </head>
  <body data-spy="scroll" data-target=".site-navbar-target" data-offset="300">
    
    
    <nav class="navbar navbar-expand-lg navbar-dark ftco_navbar ftco-navbar-light site-navbar-target" id="ftco-navbar">
      <div class="container">
        <a class="navbar-brand" href="../index.php" style="color: black;"><span style="color: black;">Elab-</span>Clone</a>
        <!-- <button class="navbar-toggler js-fh5co-nav-toggle fh5co-nav-toggle" type="button" data-toggle="collapse" data-target="#ftco-nav" aria-controls="ftco-nav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="oi oi-menu"></span> Menu
        </button> -->

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
      <div class="container" style="border:solid;">
  <form method="GET">
  <div class="btns" style="float: left; margin-top: 20px;">
    <button type="submit" class="btn btn-primary" name="QID" value="<?php echo $id; ?>" style="margin-left: 20px;" formaction="previous.php">Previous Question</button>
  </div>  
  <div class="btns" style="float: right; margin-top: 20px;">
    <button type="submit" class="btn btn-primary" name="QID" value="<?php echo $id; ?>" style="margin-right: 20px;" formaction="next.php">Next Question</button>
  </div> 
  </form> 
<div _ngcontent-c16="" class="outer">

 <div _ngcontent-c16="" class="container ng-star-inserted">


    <div _ngcontent-c16="" class="question">
      <div _ngcontent-c16="" class="inner"><mat-card _ngcontent-c16="" class="mat-elevation-z2 mat-card">
        <h4 _ngcontent-c16="">QUESTION</h4>
        <mat-divider _ngcontent-c16="" class="mat-divider" role="separator" aria-orientation="horizontal"></mat-divider>
        <div _ngcontent-c16="" class="list">
          <div _ngcontent-c16="" class="list-item">
            <a _ngcontent-c16="" class="title">SESSION: <span name="sessiondata"><?php echo $session; ?></span> </a>
          </div>
          <mat-divider _ngcontent-c16="" class="mat-divider" role="separator" aria-orientation="horizontal"></mat-divider>
          <div _ngcontent-c16="" class="list-item">
            <a _ngcontent-c16="" class="title"><span name="questionno">Q.<?php echo $id; ?>:</span></a>
            <a _ngcontent-c16=""><span name="questionname"><?php echo $QNAME; ?></span> </a>
          </div>
          <mat-divider _ngcontent-c16="" class="mat-divider" role="separator" aria-orientation="horizontal"></mat-divider>
          <div _ngcontent-c16="" class="list-item">
            <a _ngcontent-c16="" class="title">QUESTION DESCRIPTION </a><br _ngcontent-c16=""><br _ngcontent-c16="">
            <a _ngcontent-c16=""><span name="questiondesc"><?php echo $QNDESC; ?></span></a>
          </div>
          <mat-divider _ngcontent-c16="" class="mat-divider" role="separator" aria-orientation="horizontal"></mat-divider>
          <?php for($j=0; $j<count($TCNO); $j++){ ?>
              <div _ngcontent-c16="" class="list-item ng-star-inserted">
                    <a _ngcontent-c16="" class="title"><span name="tcno"><?php echo $TCNO[$j]; ?></span></a><br _ngcontent-c16=""><br _ngcontent-c16="">
                    <a _ngcontent-c16="" class="title">INPUT </a>
                    <pre _ngcontent-c16=""><code _ngcontent-c16=""><span name="tcinp"><?php echo $IP[$j]; ?></span></code></pre>
                    <a _ngcontent-c16="" class="title">OUTPUT </a>
                    <pre _ngcontent-c16=""><code _ngcontent-c16=""><span name="tcout"><?php echo $OP[$j]; ?></span></code></pre>
              </div>
              <mat-divider _ngcontent-c16="" class="mat-divider ng-star-inserted" role="separator" aria-orientation="horizontal"></mat-divider>
             <?php } ?>
        </div>
      </mat-card>
      </div>
    </div>
    <div _ngcontent-c16="" class="solution" >
      <mat-card _ngcontent-c16="" class="mat-elevation-z2 mat-card" style="display: block">
        <h4 _ngcontent-c16="">PYTHON CODE</h4>
        <mat-divider _ngcontent-c16="" class="mat-divider" role="separator" aria-orientation="horizontal"></mat-divider>
        <br _ngcontent-c16="">
    <!-- <textarea rows=22 style="width:100%;" readonly><?php #echo $CODE; ?></textarea> -->
     <div class="codeeditor" id="jseditor">
      <?php echo $CODE; ?>
     </div>

      </mat-card>
    </div>
  </div>
</div>
</div>
</div>
 <script type="text/javascript">
    var e = ace.edit("jseditor");
    e.getSession().setMode("ace/mode/python");
    //e.setTheme("ace/theme/github");
    e.getSession().setTabSize(1);
    //e.renderer.setShowGutter(false);
  </script>
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
  <script src="tabledata/vendor/jquery/jquery-3.2.1.min.js"></script>
<!--===============================================================================================-->
  <script src="tabledata/vendor/bootstrap/js/popper.js"></script>
  <script src="tabledata/vendor/bootstrap/js/bootstrap.min.js"></script>
<!--===============================================================================================-->
  <script src="tabledata/vendor/select2/select2.min.js"></script>
<!--===============================================================================================-->
  <script src="tabledata/vendor/perfect-scrollbar/perfect-scrollbar.min.js"></script>
  <script>
    $('.js-pscroll').each(function(){
      var ps = new PerfectScrollbar(this);

      $(window).on('resize', function(){
        ps.update();
      })
    });
      
    
  </script>
<!--===============================================================================================-->
  <script src="tabledata/js/main.js"></script>

  </body>
</html>