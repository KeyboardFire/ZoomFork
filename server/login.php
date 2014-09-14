<?php
$webroot = '/zoomfork';
$serverroot = $_SERVER['DOCUMENT_ROOT'] . $webroot;
session_save_path("$serverroot/_sessions"); session_start();
?><?php
// Check login/registration info. This has to be done first; otherwise we can't redirect at the end.
if (!isset($_SESSION["userid"]) && count($_POST) != 0) {
    function begonewithyou($serverroot, $webroot) {
        header("Location: http://" . $_SERVER["HTTP_HOST"] . $webroot);
        die();
    }
    function checkinfo($serverroot, $webroot) {
        // First check the CAPTCHA
        require_once("$serverroot/recaptchalib.php");
        include("$serverroot/recaptchacreds.php");
        $captcha = recaptcha_check_answer($captchaprivatekey, $_SERVER["REMOTE_ADDR"],
            $_POST["recaptcha_challenge_field"], $_POST["recaptcha_response_field"]);
        if (!$captcha->is_valid) {
            return "You entered the CAPTCHA wrong. (Yeah, yeah, I know, they're frustrating.) Please go back and try again.";
        }

        // Sanity checks
        if (   !isset($_POST["username"])
            || !isset($_POST["password"])
            || strlen($_POST["username"]) == 0
            || strlen($_POST["password"]) == 0
        ) {
            return "Please specify a username and a password.";
        }
        if (strlen($_POST["username"]) > 30) {
            return "Your username is too long. The maximum is 30 characters.";
        }

        try {
            include("$serverroot/dbcreds.php");
            $dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);
            if (isset($_POST["login"])) {
                $stmt = $dbh->prepare("SELECT id, password, salt FROM users WHERE username = ?");
                $stmt->execute(array($_POST["username"]));
                list($id, $password, $salt) = $stmt->fetch();
                if (crypt($_POST["password"], '$2a$07$' . $salt . '$') == $password) {
                    $_SESSION["userid"] = $id;
                    $_SESSION["username"] = $_POST["username"];

                    // Successfully logged in!
                    begonewithyou($serverroot, $webroot);
                } else {
                    return "Wrong username or password; please try again.";
                }
            } else if (isset($_POST["register"])) {
                // First make sure the username isn't already taken
                $stmt = $dbh->prepare("SELECT id FROM users WHERE username = ?");
                $stmt->execute(array($_POST["username"]));
                if (array_key_exists('id', $stmt->fetch())) {
                    return "A user with that username already exists; please try again.";
                }

                $salt = uniqid("", true);
                $saltypass = crypt($_POST["password"], '$2a$07$' . $salt . '$');
                $stmt = $dbh->prepare("INSERT INTO users (username, password, salt) VALUES (?, ?, ?)");
                $stmt->execute(array($_POST["username"], $saltypass, $salt));

                // Might as well log in, to be convenient
                $stmt = $dbh->prepare("SELECT id FROM users WHERE username = ?");
                $stmt->execute(array($_POST["username"]));
                list($id) = $stmt->fetch();
                $_SESSION["userid"] = $id;
                $_SESSION["username"] = $_POST["username"];

                // Account successfully created!
                begonewithyou($serverroot, $webroot);
            } else {
                return "Either your browser sent a weird POST request, or you tried to manually submit the form without logging in <em>or</em> registering. In either case, I definitely can't do anything about it. Sorry.";
            }
        } catch (PDOException $e) {
            return "A database error has occurred. Sorry for the inconvenience; we're probably already trying to fix it! [" . $e->getMessage() . "]";
        }
    }
    $msg = checkinfo($serverroot, $webroot);
}
?>
<!DOCTYPE html>
<html lang='en'>
    <head>
        <style type='text/css'>
            input {
                width: 100%;
            }
        </style>
        <?php include("$serverroot/head.php"); ?>
        <title>Login or register - ZoomFork</title>
    </head>
    <body>
        <?php include("$serverroot/header.php"); ?>
        <div id='container'>
            <?php if (isset($_SESSION["userid"])) { ?>
                You are already logged in. <a href='logout.php'>Log out?</a>
            <?php } else { ?>
                <?php
                    if ($msg != "") {
                        echo "<div id='checkinfomsg'>$msg</div>";
                    }
                ?>
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
                                    require_once("$serverroot/recaptchalib.php");
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
            <?php } ?>
        </div>
    </body>
</html>
