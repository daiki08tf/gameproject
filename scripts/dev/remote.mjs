// ./dev remote — Tailnet-only iPhone access to Blade Vale.
//
// Reuses this Mac's established remote-access conventions:
//   - LaunchAgent (~/Library/LaunchAgents/com.daiki-suda.bladevale.plist)
//     keeps the game server alive across logins/restarts.
//   - Tailscale Serve mounts /bladevale on the existing tailnet host —
//     tailnet-only, no Funnel, no LAN bind.
//
//   iPhone URL: https://<mac>.<tailnet>.ts.net/bladevale/
import { execFileSync, execFile } from 'node:child_process';
import { writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';

const execFileP = promisify(execFile);
const ROOT = resolve(new URL('../../', import.meta.url).pathname);
const LABEL = 'com.daiki-suda.bladevale';
const PLIST = join(homedir(), 'Library', 'LaunchAgents', `${LABEL}.plist`);
const DAEMON = join(ROOT, 'scripts', 'dev', 'playDaemon.mjs');
const NODE = process.execPath;
const PORT = 8471;
const MOUNT = '/bladevale';
const LOG_DIR = join(homedir(), 'Library', 'Logs');
const UID = process.getuid?.() ?? 501;
const DOMAIN = `gui/${UID}`;

function sh(cmd, args, { ignoreFail = false } = {}) {
  try {
    return { ok: true, out: execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim() };
  } catch (e) {
    if (ignoreFail) return { ok: false, out: String(e.stdout || e.stderr || e.message || e).trim() };
    throw e;
  }
}

function tailnetHost() {
  try {
    const st = JSON.parse(execFileSync('tailscale', ['status', '--json'], { encoding: 'utf8' }));
    const dns = (st.Self?.DNSName || '').replace(/\.$/, '');
    return dns || null;
  } catch { return null; }
}

function remoteUrl() {
  const host = tailnetHost();
  return host ? `https://${host}${MOUNT}/` : null;
}

function plistXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${NODE}</string>
    <string>${DAEMON}</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>ProcessType</key>
  <string>Background</string>
  <key>StandardOutPath</key>
  <string>${LOG_DIR}/bladevale-remote.log</string>
  <key>StandardErrorPath</key>
  <string>${LOG_DIR}/bladevale-remote-error.log</string>
</dict>
</plist>
`;
}

function agentRunning() {
  const r = sh('launchctl', ['print', `${DOMAIN}/${LABEL}`], { ignoreFail: true });
  return r.ok && /state = running/.test(r.out);
}

function agentLoaded() {
  return existsSync(PLIST);
}

async function ensureServeMount() {
  // tailscale serve is idempotent for an identical mapping.
  await execFileP('tailscale', ['serve', '--bg', '--set-path', MOUNT, `http://127.0.0.1:${PORT}${MOUNT}`]);
}

async function dropServeMount() {
  await execFileP('tailscale', ['serve', '--bg', '--set-path', MOUNT, 'off']);
}

function plistStatus() {
  return { loaded: agentLoaded(), running: agentRunning() };
}

export async function runRemote(args = []) {
  const sub = args[0] || 'status';
  switch (sub) {
    case 'start': {
      mkdirSync(LOG_DIR, { recursive: true });
      writeFileSync(PLIST, plistXml());
      sh('launchctl', ['bootstrap', DOMAIN, PLIST], { ignoreFail: true });
      sh('launchctl', ['kickstart', `${DOMAIN}/${LABEL}`], { ignoreFail: true });
      await ensureServeMount();
      console.log(`Blade Vale remote: started (127.0.0.1:${PORT})`);
      console.log(`iPhone URL: ${remoteUrl() || '(tailscale status failed — is Tailscale up?)'}`);
      break;
    }
    case 'stop': {
      await dropServeMount().catch(() => {});
      if (agentLoaded()) {
        sh('launchctl', ['bootout', `${DOMAIN}/${LABEL}`], { ignoreFail: true });
        rmSync(PLIST, { force: true }); // otherwise it reloads at next login
      }
      console.log('Blade Vale remote: stopped (agent removed, tailnet route removed)');
      break;
    }
    case 'restart': {
      if (!agentLoaded()) { console.error('dev remote: not installed — run ./dev remote start first'); process.exit(1); }
      sh('launchctl', ['kickstart', '-k', `${DOMAIN}/${LABEL}`]);
      console.log('Blade Vale remote: restarted');
      break;
    }
    case 'status': {
      const { loaded, running } = plistStatus();
      const local = sh('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', `http://127.0.0.1:${PORT}/`], { ignoreFail: true });
      const serve = sh('tailscale', ['serve', 'status'], { ignoreFail: true });
      const mounted = serve.ok && serve.out.includes(MOUNT);
      const tsUp = sh('tailscale', ['status'], { ignoreFail: true });
      console.log(`launchagent : ${loaded ? (running ? 'running' : 'loaded (not running)') : 'not installed'}`);
      console.log(`local server: 127.0.0.1:${PORT} -> ${local.out || 'no response'}`);
      console.log(`tailscale   : ${tsUp.ok ? 'up' : 'down'}`);
      console.log(`serve mount : ${mounted ? `${MOUNT} mounted (tailnet only)` : 'not mounted'}`);
      console.log(`iphone url  : ${remoteUrl() || 'unavailable'}`);
      break;
    }
    case 'url':
      console.log(remoteUrl() || 'tailscale unavailable');
      break;
    default:
      console.error('usage: ./dev remote <start|stop|restart|status|url>');
      process.exit(1);
  }
}
