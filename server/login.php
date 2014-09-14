<?php
$root = $_SERVER['DOCUMENT_ROOT'] . '/zoomfork';
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
                // First check the CAPTCHA
                require_once("$root/recaptchalib.php");
                include("$root/recaptchacreds.php");
                $captcha = recaptcha_check_answer($captchaprivatekey, $_SERVER["REMOTE_ADDR"],
                    $_POST["recaptcha_challenge_field"], $_POST["recaptcha_response_field"]);
                if (!$captcha->is_valid) {
                    die("You entered the CAPTCHA wrong. (Yeah, yeah, I know, they're frustrating.) Please go back and try again.");
                }

            try {
                include("$root/dbcreds.php");
                $dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);
                if (isset($_POST["login"])) {
                    $stmt = $dbh->prepare("SELECT id, password, salt FROM users WHERE username = ?");
                    $stmt->execute(array($_POST["username"]));
                    list($id, $password, $salt) = $stmt->fetch();
                    if (crypt($_POST["password"], '$2a$07$' . $salt . '$') == $password) {
                        die("Successfully logged in!");
                    } else {
                        die("Wrong password; please try again.");
                    }
                } else if (isset($_POST["register"])) {
                    $salt = uniqid("", true);
                    $saltypass = crypt($_POST["password"], '$2a$07$' . $salt . '$');
                    $stmt = $dbh->prepare("INSERT INTO users (username, password, salt) VALUES (?, ?, ?)");
                    $stmt->execute(array($_POST["username"], $saltypass, $salt));
                    die("Account successfully created!");
                } else {
                    die("Either your browser sent a weird POST request, or you tried to manually submit the form without logging in <em>or</em> registering. In either case, I definitely can't do anything about it. Sorry.");
                }
            } catch (PDOException $e) {
                die("A database error has occurred. Sorry for the inconvenience; we're probably already trying to fix it! [" . $e->getMessage() . "]");
            }
        } ?>
    </body>
</html>
