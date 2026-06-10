<?php
// ── Email Forwarding Micro-SaaS ──
// Self-hosted email forwarding API
// Upload to Hostinger and configure forwarding addresses below

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// ── CONFIGURATION ──
$config_file = __DIR__ . '/mail-config.json';
$data_file = __DIR__ . '/mail-submissions.json';
$pass_hash_file = __DIR__ . '/mail-password.txt';

// Default config
$default_config = [
    'forward_to' => 'info@temtemsabah.com',
    'from_name' => 'Tem Tem Sabah Website',
    'from_email' => 'noreply@temtemsabah.com',
    'subject_prefix' => '[TemTemSabah] ',
    'smtp_host' => '',
    'smtp_port' => 587,
    'smtp_user' => '',
    'smtp_pass' => '',
];

// Load or create config
if (!file_exists($config_file)) {
    file_put_contents($config_file, json_encode($default_config, JSON_PRETTY_PRINT));
    // Set default password
    file_put_contents($pass_hash_file, password_hash('admin123', PASSWORD_DEFAULT));
    $config = $default_config;
} else {
    $config = json_decode(file_get_contents($config_file), true);
}

// Load submissions
$submissions = [];
if (file_exists($data_file)) {
    $submissions = json_decode(file_get_contents($data_file), true);
}
if (!is_array($submissions)) $submissions = [];

// ── ROUTING ──
$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'send') {
    // ── Receive form submission ──
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) $input = $_POST;
    
    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $message = trim($input['message'] ?? '');
    $phone = trim($input['phone'] ?? '');
    
    if (!$name || !$email || !$message) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Name, email and message required']);
        exit;
    }
    
    // Save to local storage
    $entry = [
        'id' => uniqid('msg_'),
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'message' => $message,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
        'timestamp' => date('c'),
        'forwarded' => false,
    ];
    $submissions[] = $entry;
    file_put_contents($data_file, json_encode($submissions, JSON_PRETTY_PRINT));
    
    // ── Forward via email ──
    $to = $config['forward_to'];
    $subject = $config['subject_prefix'] . "New enquiry from $name";
    $body = "You have received a new contact form submission:\n\n"
          . "Name: $name\n"
          . "Email: $email\n"
          . ($phone ? "Phone: $phone\n" : "")
          . "Message:\n$message\n\n"
          . "---\nSent via TemTemSabah website contact form\n"
          . "IP: {$entry['ip']}\n"
          . "Time: {$entry['timestamp']}";
    $headers = "From: {$config['from_name']} <{$config['from_email']}>\r\n"
             . "Reply-To: $email\r\n"
             . "X-Mailer: PHP/" . phpversion();
    
    $sent = mail($to, $subject, $body, $headers);
    
    // Mark as forwarded if sent
    if ($sent) {
        $submissions[count($submissions)-1]['forwarded'] = true;
        file_put_contents($data_file, json_encode($submissions, JSON_PRETTY_PRINT));
    }
    
    echo json_encode([
        'ok' => true,
        'message' => 'Message received! We will get back to you soon.',
        'forwarded' => $sent,
    ]);
    exit;
}

// ── Dashboard: Login ──
if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $password = $input['password'] ?? '';
    $hash = file_get_contents($pass_hash_file);
    if (password_verify($password, $hash)) {
        $token = bin2hex(random_bytes(16));
        file_put_contents(__DIR__ . '/mail-session.txt', $token);
        echo json_encode(['ok' => true, 'token' => $token]);
    } else {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Wrong password']);
    }
    exit;
}

// ── Dashboard: View submissions ──
if ($action === 'submissions') {
    $token = $_GET['token'] ?? '';
    $stored = @file_get_contents(__DIR__ . '/mail-session.txt');
    if ($token !== $stored) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Unauthorized']);
        exit;
    }
    // Return last 100 submissions (newest first)
    $recent = array_reverse(array_slice($submissions, -100));
    echo json_encode(['ok' => true, 'submissions' => $recent, 'config' => [
        'forward_to' => $config['forward_to'],
        'total_submissions' => count($submissions),
    ]]);
    exit;
}

// ── Dashboard: Update config ──
if ($action === 'config' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_GET['token'] ?? '';
    $stored = @file_get_contents(__DIR__ . '/mail-session.txt');
    if ($token !== $stored) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Unauthorized']);
        exit;
    }
    $input = json_decode(file_get_contents('php://input'), true);
    foreach (['forward_to', 'from_name', 'from_email', 'subject_prefix'] as $key) {
        if (isset($input[$key])) $config[$key] = $input[$key];
    }
    file_put_contents($config_file, json_encode($config, JSON_PRETTY_PRINT));
    echo json_encode(['ok' => true, 'message' => 'Config updated']);
    exit;
}

// ── Dashboard: HTML page ──
if ($action === 'dashboard') {
    ?>
    <!DOCTYPE html>
    <html>
    <head><title>Email Forwarding Dashboard</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: system-ui, sans-serif; background: #0f1219; color: #e0e6ed; padding: 1.5rem; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { font-size: 1.25rem; margin-bottom: 1rem; }
    .card { background: #1a1f2e; border: 1px solid #2a3040; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
    .msg { background: #0f1219; border: 1px solid #2a3040; border-radius: 6px; padding: 0.75rem; margin-bottom: 0.5rem; }
    .msg .meta { font-size: 0.75rem; color: #6b7280; margin-bottom: 0.25rem; }
    .msg .name { font-weight: 600; color: #e0e6ed; }
    .msg .text { font-size: 0.85rem; color: #9ca3af; margin-top: 0.25rem; }
    .badge { display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 0.65rem; }
    .badge-sent { background: #7fd962; color: #000; }
    .badge-pending { background: #f59e0b; color: #000; }
    .login-form { max-width: 300px; margin: 4rem auto; }
    input, button { width: 100%; padding: 0.6rem; border-radius: 6px; border: 1px solid #2a3040; background: #0f1219; color: #e0e6ed; margin-bottom: 0.5rem; font-size: 0.9rem; }
    button { background: #00373e; color: white; border: none; cursor: pointer; }
    .stats { display: flex; gap: 1rem; margin-bottom: 1rem; font-size: 0.85rem; }
    .stats span { color: #6b7280; }
    .stats strong { color: #e0e6ed; }
    </style>
    </head>
    <body>
    <div class="container" id="app">
        <div id="login-view">
            <div class="login-form card">
                <h1>📨 Email Forwarding</h1>
                <input type="password" id="pwd" placeholder="Admin password" onkeydown="if(event.key==='Enter')login()">
                <button onclick="login()">Login</button>
                <p id="err" style="color:#f26d78;font-size:0.8rem;display:none"></p>
            </div>
        </div>
        <div id="dash-view" style="display:none">
            <h1>📨 Email Forwarding Dashboard</h1>
            <div class="stats" id="stats"></div>
            <div id="submissions"></div>
        </div>
    </div>
    <script>
    let token = localStorage.getItem('mail_token');
    if (token) showDash();
    
    function login() {
        const pwd = document.getElementById('pwd').value;
        fetch('?action=login', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({password: pwd})
        }).then(r=>r.json()).then(d=>{
            if(d.ok) { token=d.token; localStorage.setItem('mail_token',token); showDash(); }
            else { document.getElementById('err').textContent='Wrong password'; document.getElementById('err').style.display='block'; }
        });
    }
    
    function showDash() {
        document.getElementById('login-view').style.display='none';
        document.getElementById('dash-view').style.display='block';
        fetch('?action=submissions&token='+token).then(r=>r.json()).then(d=>{
            if(!d.ok) { localStorage.removeItem('mail_token'); location.reload(); return; }
            const subs = d.submissions || [];
            document.getElementById('stats').innerHTML = 
                '<span>Total: <strong>'+d.config.total_submissions+'</strong></span>' +
                '<span>Forwarding to: <strong>'+d.config.forward_to+'</strong></span>';
            document.getElementById('submissions').innerHTML = subs.map(s =>
                '<div class="msg">' +
                '<div class="meta">' + s.timestamp + ' &middot; IP: ' + s.ip + 
                ' <span class="badge '+(s.forwarded?'badge-sent':'badge-pending')+'">'+(s.forwarded?'✓ Forwarded':'⏳ Pending')+'</span></div>' +
                '<div class="name">' + s.name + ' &lt;' + s.email + '&gt;' + (s.phone ? ' &middot; ' + s.phone : '') + '</div>' +
                '<div class="text">' + s.message.replace(/\n/g,'<br>') + '</div>' +
                '</div>'
            ).join('');
        });
    }
    </script>
    </body>
    </html>
    <?php
    exit;
}

// Default: show info
echo json_encode([
    'ok' => true,
    'service' => 'Email Forwarding API',
    'version' => '1.0',
    'endpoints' => [
        'POST ?action=send' => 'Submit a contact form',
        'GET ?action=dashboard' => 'View submissions dashboard',
        'POST ?action=login' => 'Login to dashboard',
        'GET ?action=submissions&token=...' => 'Get submissions (auth required)',
    ],
]);
