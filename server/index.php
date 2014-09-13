<?php
$root = ".";
session_save_path("$root/_sessions"); session_start();
?>
<!DOCTYPE html>
<html lang='en'>
    <head>
        <meta charset='utf-8' />
        <title>The official ZoomFork server</title>
    </head>
    <body>
        <?php include("account-widget.php"); ?>
    </body>
</html>
