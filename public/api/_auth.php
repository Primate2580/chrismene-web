<?php
// Shared helper: only lets the Firebase admin account through.
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');

function fail_json($code, $msg) { http_response_code($code); echo json_encode(['error' => $msg]); exit; }

$cfgFile = __DIR__ . '/config.php';
if (!file_exists($cfgFile)) fail_json(500, 'api/config.php is missing on the server. Copy config.sample.php to config.php and fill it in.');
$CFG = require $cfgFile;

function bearer() {
  $h = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
  if (!$h && function_exists('getallheaders')) { foreach (getallheaders() as $k => $v) if (strtolower($k) === 'authorization') $h = $v; }
  return preg_match('/^Bearer\s+(.+)$/i', $h, $m) ? trim($m[1]) : '';
}

function require_admin($CFG) {
  $token = bearer();
  if (!$token) fail_json(401, 'Please sign in again.');
  // Ask Firebase who this token belongs to (it rejects forged or expired tokens).
  $url = 'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' . urlencode($CFG['firebase_api_key']);
  $body = json_encode(['idToken' => $token]);
  $ctx = stream_context_create(['http' => ['method' => 'POST', 'header' => "Content-Type: application/json\r\n", 'content' => $body, 'timeout' => 10, 'ignore_errors' => true]]);
  $raw = false;
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $body, CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10]);
    $raw = curl_exec($ch); curl_close($ch);
  } else { $raw = @file_get_contents($url, false, $ctx); }
  $data = $raw ? json_decode($raw, true) : null;
  $uid = $data['users'][0]['localId'] ?? '';
  if (!$uid || !hash_equals((string)$CFG['admin_uid'], (string)$uid)) fail_json(401, 'Please sign in again.');
}

function uploads_dir() {
  $dir = dirname(__DIR__) . '/uploads';
  if (!is_dir($dir)) @mkdir($dir, 0755, true);
  // uploaded files may never be run as code
  $ht = $dir . '/.htaccess';
  if (!file_exists($ht)) @file_put_contents($ht, "Options -Indexes -ExecCGI\nRemoveHandler .php .phtml .php3 .php5 .php7 .phps\nRemoveType .php .phtml\n<FilesMatch \"\\.(php|phtml|phar|cgi|pl|py|sh)\$\">\n  Require all denied\n</FilesMatch>\n");
  return $dir;
}
