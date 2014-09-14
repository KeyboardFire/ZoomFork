<?php
$webroot = '/zoomfork';
$serverroot = $_SERVER['DOCUMENT_ROOT'] . $webroot;
session_save_path("$serverroot/_sessions"); session_start();
?>
<!DOCTYPE html>
<html lang='en'>
    <head>
        <meta charset='utf-8' />
        <?php include("$serverroot/head.php"); ?>
        <title>The official ZoomFork server</title>
    </head>
    <body>
        <?php include("$serverroot/header.php"); ?>
    </body>
</html>
