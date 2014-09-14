<div id='account-widget'>
<?php
if (isset($_SESSION["userid"])) {
    $uname = htmlspecialchars($_SESSION['username']);
    echo "Logged in as $uname | <a href='$webroot/logout.php'>Log out</a>";
} else {
    echo "<a href='$webroot/login.php'>Log in or register</a>";
}
?>
</div>
