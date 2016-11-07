<?php
/**
 * Created by IntelliJ IDEA.
 * User: lalittanwar
 * Date: 05/11/16
 * Time: 4:52 PM
 */

//error_reporting(0);
require 'vendor/smarty/smarty/libs/Smarty.class.php';
$smarty = new Smarty;

//$smarty->force_compile = true;
$smarty->debugging = false;
$smarty->caching = true;
$smarty->cache_lifetime = 120;
$smarty->setTemplateDir("/");

$smarty->assign("profile", include("profile.php"), true);
$smarty->assign("PROFILE", include("profile.php"), true);

file_put_contents("index.html", $smarty->fetch('index.tpl'));