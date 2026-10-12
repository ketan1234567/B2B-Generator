<?php
include('../mailer_config/mailerConfig.php');   


 require "../DataCurlNodeApi/DataCurlNodeApiFunctions.php";



 /*ini_set('display_errors', 1);
 ini_set('display_startup_errors', 1);
 error_reporting(E_ALL);*/

$ENDURL = "https://b2b-insight.biz-tech-insights.com/whitepaper/LP-FY27-Q4-Dell-ISG-ECS-CA-1.pdf";

$fields = [
    "firstname" => "firstname",
    "lastname" => 0,
	"email" => 1,
	"company" => 2,
	"phone" => 3,
	"title" => 4,
	"address" => 5,
	"address1" => 6,
	"city" => 7,
	"Provinces" => 8,
	"postal" => 9,
    "country" => 10,
	 "comp_size" => 11,
	"industry" => 12,
	"cq1" => 20,
	"cq2" => 21,
	"cq3" => 23,
	//"cq4" => 23,
	//"opt-in1" => 24,
	"opt-in2" => 25,
	"opt-in3" => 26,
	//"optn2" => 16
	//"optn3" => 17
	
   
];

$mapped_data = [];

foreach ($fields as $key => $value) {
    $mapped_data[$key] = is_numeric($value) ? $_POST["data"][$value] : $_POST[$value];
}



// Country code from form 
$c1=$mapped_data["country"];

// GDPR Countries (EU + EEA)
$gdprCountries = [
    "AT", // Austria
    "BE", // Belgium
    "BG", // Bulgaria
    "HR", // Croatia
    "CY", // Cyprus
    "CZ", // Czech Republic
    "DK", // Denmark
    "EE", // Estonia
    "FI", // Finland
    "FR", // France
    "DE", // Germany
    "GR", // Greece
    "HU", // Hungary
    "IE", // Ireland
    "IT", // Italy
    "LV", // Latvia
    "LT", // Lithuania
    "LU", // Luxembourg
    "MT", // Malta
    "NL", // Netherlands
    "PL", // Poland
    "PT", // Portugal
    "RO", // Romania
    "SK", // Slovakia
    "SI", // Slovenia
    "ES", // Spain
    "SE", // Sweden
    "GB",  // United Kingdom

"NO",//Norway
"CH"//Switzerland

];

if (in_array($c1, $gdprCountries, true)) {
    // GDPR page
    $ENDURL = "https://b2b-insight.biz-tech-insights.com/whitepaper/LP-FY27-Q4-Dell-ISG-ECS-CA-1-thankyou.html";
} else {
    // Non-GDPR page
    $ENDURL = "https://b2b-insight.biz-tech-insights.com/whitepaper/LP-FY27-Q4-Dell-ISG-ECS-CA-1.pdf";
}




$camp_id = $_POST["camp_id"];
//DON'T CHANGE THIS CODE (Data Get From LP)
$URL = ($_SERVER['HTTP_REFERER']);
$firstname = $_POST["firstname"];
$temp=json_encode(   utf8_converter( array('Field Count' => count($mapped_data)) +  $mapped_data )); 
$pattern = '/[a-z0-9_\-\+\.]+@[a-z0-9\-]+\.([a-z]{2,4})(?:\.[a-z]{2})?/i';
preg_match_all($pattern, $temp, $matches);
$email = array_shift($matches[0]);
//DON'T CHANGE THIS CODE END





/*-------  API CALL ------------*/
$data = array( 'camp_id' => $camp_id, 'tempdata' => $temp,  'ip_address' => getClientIp(), 'URL' => array("URL"=>$URL,"END_URL"=>$ENDURL) );

dataCurlAPI(_W8_, $data);

                     
$mail->From = "campaign@b2b-insight.biz-tech-insights.com";
$mail->FromName = "Biz-Tech-Insights";
$mail->addAddress($email, $firstname);

$mail->isHTML(true);


$mail->Subject = 'Thank you for your interest ';
$mail->Body = "<p style='text-align: justify; font-size: 14px;'>Dear <b>$firstname</b>,</p>


<p style='text-align: justify; font-size: 14px;'>
Thank you for recently downloading Dell&#8217;s white paper, <b><a href='https://b2b-insight.biz-tech-insights.com/whitepaper/LP-FY27-Q4-Dell-ISG-ECS-CA-1.pdf'>Production Ready AI Infastructure: A Deployment Path for Any Data Center</a></b></p>

<p style='text-align: justify; font-size: 14px;'>
We hope you found it helpful.
</p>

<!--
<p style='text-align: justify; font-size: 14px;'>
<strong>Ready to explore more?</strong>
<br>
Watch our latest <a href='https://www.dell.com/en-uk/dt/microsites/emea-digital-events.htm?dgc=em&cid=thankyou_em_EMEA_&lid=EMEA_thankyou_email&RefID=em_EMEAthankyou#tab0=1'>on-demand webinars</a> on AI PCs, workstations, infrastructure modernization, cyber resilience, and AI solutions, available anytime, anywhere.
</p>--->

<p style='text-align: justify; font-size: 14px;'>
Sincerely,<br>
Nina Ridgeway<br>
Biz-Tech-Insights
</p>

<p style='text-align: justify; font-size: 14px;'>
P.S. Thanks for trusting us with your need for smart content.
</p>

<center>
<p style='text-align: center; font-size: 12px;'>
Biz-Tech-Insights, 300 California St., Suite 200, San Francisco, CA 94104
<br><br>
You received this email because you signed up for content from Biz-Tech-Insights.<br>
You can access our Privacy Policy <a href='https://biz-tech-insights.com/privacy-policy/'>here</a>, or click <a href='https://b2b-insight.biz-tech-insights.com/unsubscribed/'>here</a> to unsubscribe.
<br>
<a href='https://www.dell.com/en-uk/lp/legal/policies-privacy '>Dell Privacy Policy</a>

</p>
</center>";


$mail->AltBody = "";

try {
    $mail->send();
	// exit();
    // echo "Message has been sent successfully";
	// header('Location: https://www.google.com/');
	echo "<script>
	window.location.href = '$ENDURL';
	</script>";
} catch (Exception $e) {
    // echo "Mailer Error: " . $mail->ErrorInfo;
}

?>
