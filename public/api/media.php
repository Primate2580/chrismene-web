<?php
require __DIR__ . '/_auth.php';
require_admin($CFG);
$dir = uploads_dir();

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  $name = basename($_GET['name'] ?? '');
  if ($name === '' || $name[0] === '.' || $name !== ($_GET['name'] ?? '')) fail_json(400, 'Bad file name.');
  $path = $dir . '/' . $name;
  if (is_file($path)) @unlink($path);
  echo json_encode(['ok' => true]); exit;
}

$img = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif']; $vid = ['mp4', 'webm', 'mov', 'ogv'];
$out = [];
foreach (scandir($dir) as $n) {
  if ($n[0] === '.' || !is_file("$dir/$n")) continue;
  $e = strtolower(pathinfo($n, PATHINFO_EXTENSION));
  $out[] = ['name' => $n, 'url' => '/uploads/' . $n, 'type' => in_array($e, $img) ? 'image' : (in_array($e, $vid) ? 'video' : 'audio'),
            'size' => filesize("$dir/$n"), 'createdAt' => gmdate('c', filemtime("$dir/$n"))];
}
usort($out, fn($a, $b) => strcmp($b['createdAt'], $a['createdAt']));
echo json_encode($out);
