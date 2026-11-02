<?php
// Trimite pe e-mail mesajele din formularele site-ului.
$destinatar = 'vanzari@sistemedauer.ro';
$expeditor  = 'noreply@sistemedauer.ro';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit('{"ok":false}'); }
// Câmp capcană pentru roboți: oamenii îl lasă gol
if (!empty($_POST['website'])) { exit('{"ok":true}'); }

$etichete = [
  'nume' => 'Nume', 'telefon' => 'Telefon', 'email' => 'E-mail', 'f-news' => 'E-mail',
  'tip' => 'Interes', 'mesaj' => 'Detalii', 'pagina' => 'Pagina',
];

$randuri = [];
$replyTo = '';
foreach ($_POST as $cheie => $valoare) {
  if (in_array($cheie, ['website', 'formular'], true) || is_array($valoare)) continue;
  $valoare = trim(substr((string)$valoare, 0, 3000));
  if ($valoare === '') continue;
  $eticheta = $etichete[$cheie] ?? ucfirst(preg_replace('/^f-/', '', preg_replace('/[^a-z0-9_-]/i', '', $cheie)));
  $randuri[] = $eticheta . ': ' . $valoare;
  if (in_array($cheie, ['email', 'f-news'], true) && filter_var($valoare, FILTER_VALIDATE_EMAIL)) $replyTo = $valoare;
}

if (count($randuri) < 2) { http_response_code(400); exit('{"ok":false}'); }

$newsletter = ($_POST['formular'] ?? '') === 'newsletter';
$subiect = $newsletter ? 'Abonare newsletter – sistemedauer.ro' : 'Cerere nouă de pe sistemedauer.ro';
$corp = implode("\n", $randuri) . "\n\nTrimis la " . date('d.m.Y H:i') . ' de pe sistemedauer.ro';

$headere = [
  'From: Site Dauer <' . $expeditor . '>',
  'Content-Type: text/plain; charset=UTF-8',
  'MIME-Version: 1.0',
];
if ($replyTo) $headere[] = 'Reply-To: ' . $replyTo;

$ok = mail($destinatar, '=?UTF-8?B?' . base64_encode($subiect) . '?=', $corp, implode("\r\n", $headere), '-f' . $expeditor);

if (!$ok) { http_response_code(500); exit('{"ok":false}'); }
echo '{"ok":true}';
