<?php
$webroot = '/zoomfork';
$serverroot = $_SERVER['DOCUMENT_ROOT'] . $webroot;
session_save_path("$serverroot/_sessions"); session_start();
?><?php
unset($_SESSION["userid"]);
unset($_SESSION["username"]);
header("Location: http://" . $_SERVER["HTTP_HOST"] . $webroot);
die();
?>
