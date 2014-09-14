<?php
$webroot = '/zoomfork';
$serverroot = $_SERVER['DOCUMENT_ROOT'] . $webroot;
session_save_path("$serverroot/_sessions"); session_start();
?>
<!DOCTYPE html>
<html lang='en'>
    <head>
        <?php include("$serverroot/head.php"); ?>
        <title>Your projects - ZoomFork</title>
    </head>
    <body>
        <?php include("$serverroot/header.php"); ?>
        <div id='container'>
            <a href='create.php'><button>Create a new project</button></a>
            <h1>Your projects</h1>
            <li>Foo</li>
            <li>Foo</li>
            <li>Foo</li>
            <li>Foo</li>
            <li>Foo</li>
            <li>Foo</li>
            <li>Foo</li>
        </div>
    </body>
</html>
