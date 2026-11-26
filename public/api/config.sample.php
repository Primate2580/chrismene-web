<?php
// Copy this file to config.php (same folder) and fill in the two values.
// config.php is NOT part of the build, so re-uploading the site never overwrites it.
return [
  'firebase_api_key' => 'PASTE_API_KEY',   // same apiKey as in src/firebaseConfig.js
  'admin_uid'        => 'PASTE_ADMIN_UID', // Firebase console → Authentication → Users → User UID
  'max_mb'           => 60,                // largest upload accepted
];
