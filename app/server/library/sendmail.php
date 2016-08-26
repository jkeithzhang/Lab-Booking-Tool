<?php
require 'PHPMailer/PHPMailerAutoload.php';


$to = $argv[1];
$subject 	= $argv[2];
$msg =$argv[3];

$mail = new PHPMailer;

//$mail->SMTPDebug = 3;                               // Enable verbose debug output

$mail->isSMTP();                                      // Set mailer to use SMTP
$mail->Host = 'mail.alcatel-lucent.com';  // Specify main and backup SMTP servers
$mail->SMTPAuth = true;                               // Enable SMTP authentication
$mail->Username = 'na02\kzhan007';                 // SMTP username
// $mail->Username = 'na02\tianweiz';
$mail->Password = "Liyue@901112$";                           // SMTP password
// $mail->Password = "#ZSky0628";
$mail->SMTPSecure = 'tls';                            // Enable TLS encryption, `ssl` also accepted
$mail->Port = 587;                                    // TCP port to connect to

$mail->From = 'ke.zhang@alcatel-lucent.com';
// $mail->From = 'tianwei.zhang@alcatel-lucent.com';
$mail->FromName = 'T3C labook';
$mail->addAddress($to);     // Add a recipient
// $mail->addAddress('ellen@example.com');               // Name is optional
// $mail->addReplyTo('ke.zhang@alcatel-lucent.com', 'Ke Zhang');
$mail->addCC('georges.brouzes@nokia.com');
$mail->addBCC('dung.h.tran@nokia.com');

// $mail->addAttachment('/var/tmp/file.tar.gz');         // Add attachments
// $mail->addAttachment('/tmp/image.jpg', 'new.jpg');    // Optional name
$mail->isHTML(true);                                  // Set email format to HTML

$mail->Subject = $subject;
$mail->Body    = $msg;
// $mail->AltBody = 'This is the body in plain text for non-HTML mail clients';

if(!$mail->send()) {
    echo 'Message could not be sent.';
    echo 'Mailer Error: ' . $mail->ErrorInfo;
} else {
    echo 'Message has been sent';
}