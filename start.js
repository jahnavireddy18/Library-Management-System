const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = __dirname;
const BACKEND_DIR = path.join(ROOT, 'backend');
const CLIENT_DIR = path.join(ROOT, 'client');
const BACKEND_PORT = 5001;
const CLIENT_PORT = 3001;

// ── Kill any process using a given port (Windows) ──────────────
function killPort(port) {
  try {
    const result = execSync(
      `netstat -ano | findstr ":${port}" | findstr "LISTENING"`,
      { shell: true, encoding: 'utf-8' }
    );
    const lines = result.trim().split('\n');
    const pids = new Set();
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') pids.add(pid);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { shell: true, stdio: 'ignore' });
        console.log(`   Killed PID ${pid} on port ${port}`);
      } catch (_) {
        // Process may have already exited
      }
    }
  } catch (_) {
    // No process on this port — good to go
  }
}

// ── Free up ports ──────────────────────────────────────────────
console.log('🔌 Freeing up ports...');
killPort(BACKEND_PORT);
killPort(CLIENT_PORT);
console.log(`   Ports ${BACKEND_PORT} and ${CLIENT_PORT} are clear.\n`);

// ── Auto-install missing dependencies ──────────────────────────
function installIfNeeded(dir, label) {
  const nodeModules = path.join(dir, 'node_modules');
  if (!fs.existsSync(nodeModules)) {
    console.log(`📦 Installing ${label} dependencies...`);
    execSync('npm install', { cwd: dir, stdio: 'inherit', shell: true });
    console.log(`✅ ${label} dependencies installed.\n`);
  }
}

installIfNeeded(BACKEND_DIR, 'Backend');
installIfNeeded(CLIENT_DIR, 'Client');

// ── Launch processes ───────────────────────────────────────────
console.log('\n🚀 Starting Smart Library Management System...');
console.log(`   Backend  → http://localhost:${BACKEND_PORT}`);
console.log(`   Frontend → http://localhost:${CLIENT_PORT}\n`);

const backend = spawn('npm', ['start'], {
  cwd: BACKEND_DIR,
  stdio: 'inherit',
  shell: true,
});

const frontend = spawn('npm', ['run', 'dev'], {
  cwd: CLIENT_DIR,
  stdio: 'inherit',
  shell: true,
});

// ── Graceful shutdown ──────────────────────────────────────────
function cleanup() {
  backend.kill();
  frontend.kill();
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

backend.on('close', (code) => {
  if (code !== null && code !== 0) {
    console.log(`\n❌ Backend exited with code ${code}`);
    frontend.kill();
    process.exit(code);
  }
});

frontend.on('close', (code) => {
  if (code !== null && code !== 0) {
    console.log(`\n❌ Frontend exited with code ${code}`);
    backend.kill();
    process.exit(code);
  }
});
