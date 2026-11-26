<?php
require __DIR__ . '/_auth.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail_json(405, 'POST only.');
require_admin($CFG);

if (empty($_FILES['file'])) fail_json(400, 'No file received (it may be larger than the server allows).');
$f = $_FILES['file'];
if ($f['error'] !== UPLOAD_ERR_OK) {
  fail_json(400, in_array($f['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE]) ? 'That file is too big for the server.' : 'Upload failed (code ' . $f['error'] . ').');
}
if ($f['size'] > ($CFG['max_mb'] ?? 60) * 1048576) fail_json(400, 'That file is larger than ' . ($CFG['max_mb'] ?? 60) . ' MB.');

$types = [
  'jpg' => ['image', ['image/jpeg']], 'jpeg' => ['image', ['image/jpeg']], 'png' => ['image', ['image/png']],
  'webp' => ['image', ['image/webp']], 'gif' => ['image', ['image/gif']], 'avif' => ['image', ['image/avif']],
  'mp4' => ['video', ['video/mp4']], 'webm' => ['video', ['video/webm', 'audio/webm']], 'mov' => ['video', ['video/quicktime']], 'ogv' => ['video', ['video/ogg', 'application/ogg']],
  'mp3' => ['audio', ['audio/mpeg', 'application/octet-stream']], 'm4a' => ['audio', ['audio/mp4', 'audio/x-m4a', 'video/mp4']],
  'aac' => ['audio', ['audio/aac', 'audio/x-hx-aac-adts']], 'wav' => ['audio', ['audio/wav', 'audio/x-wav', 'audio/vnd.wave']], 'ogg' => ['audio', ['audio/ogg', 'application/ogg']],
];
$ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
if (!isset($types[$ext])) fail_json(400, 'That file type is not allowed. Use an image, video or audio file.');
$real = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
if (!in_array($real, $types[$ext][1], true)) fail_json(400, 'The file content does not match its type (' . $real . ').');

$base = strtolower(preg_replace('/[^a-z0-9]+/i', '-', pathinfo($f['name'], PATHINFO_FILENAME)));
$base = substr(trim($base, '-'), 0, 40) ?: 'file';
$name = round(microtime(true) * 1000) . '-' . bin2hex(random_bytes(3)) . '-' . $base . '.' . $ext;
$dir = uploads_dir();
if (!move_uploaded_file($f['tmp_name'], $dir . '/' . $name)) fail_json(500, 'Could not save the file on the server.');
echo json_encode(['url' => '/uploads/' . $name, 'name' => $f['name'], 'type' => $types[$ext][0], 'size' => $f['size']]);
