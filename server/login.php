<?php
$root = "/var/www/ZoomFork/server";
session_save_path("$root/_sessions"); session_start();
?>
<!DOCTYPE html>
<html lang='en'>
    <head>
        <meta charset='utf-8' />
        <style type='text/css'>
            input {
                width: 100%;
            }
        </style>
        <title>Login or register - ZoomFork</title>
    </head>
    <body>
        <?php include("account-widget.php"); ?>
        <?php if (count($_POST) == 0) { ?>
            <form action='login.php' method='post'>
                <table>
                    <tbody>
                        <tr>
                            <th><label for='username'>Username</label></th>
                            <td><input id='username' name='username' type='text' /></td>
                        </tr>
                        <tr>
                            <th><label for='password'>Password</label></th>
                            <td><input id='password' name='password' type='password' /></td>
                        </tr>
                        <tr>
                            <th>CAPTCHA</th>
                            <td><?php
                                require_once("$root/recaptchalib.php");
                                echo recaptcha_get_html("6LfaQPoSAAAAAFJ2zs_R5YQ7iBOZmF7Bnbs6v570");
                            ?></td>
                        <tr>
                            <td colspan=2><input class='submit-button' type='submit' name='login' value='Log in' /></td>
                        </tr>
                        <tr>
                            <td colspan=2><input class='submit-button' type='submit' name='register' value='Register' /></td>
                        </tr>
                    </tbody>
                </table>
            </form>
        <?php } else {
            include("$root/dbcreds.php");
            try {
                $dbh = new PDO('mysql:host=keyboardfirecom.ipagemysql.com;dbname=zoomfork', $dbuser, $dbpass);
                echo "Good!";
            } catch (PDOException $e) {
                echo "Error! " . $e->getMessage();
                die();
            }
        } ?>
    </body>
</html>
