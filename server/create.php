<?php
$webroot = '/zoomfork';
$serverroot = $_SERVER['DOCUMENT_ROOT'] . $webroot;
session_save_path("$serverroot/_sessions"); session_start();
?>
<!DOCTYPE html>
<html lang='en'>
    <head>
        <?php include("$serverroot/head.php"); ?>
        <title>Create a project - ZoomFork</title>
    </head>
    <body>
        <?php include("$serverroot/header.php"); ?>
        <div id='container'>
            Sorry, defective electricity. There aren't enough internet monkeys to complete your request. Please clear the hamster traffic jam and lick the bamboo before trying again.
        </div>
    </body>
</html>
