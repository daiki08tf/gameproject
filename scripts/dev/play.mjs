#!/usr/bin/env node
// ./dev play — the canonical way to run Blade Vale locally.
//
// ES Modules require an http(s) origin, so the game needs a tiny static
// server. This spawns `python3 -m http.server` (the documented approach in
// README.md) on a free port, prints the URL, and stays attached until
// Ctrl+C. Falls back to `npx serve`-style node http server? No — keep it
// zero-dependency: python3 is already required by README.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve(new URL('../../', import.meta.url).pathname);
const PORTS = [8000, 8001, 8080, 0]; // 0 = let the OS pick

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
};

function serve(port) {
  return new Promise((res, rej) => {
    const server = createServer(async (req, rsp) => {
      try {
        const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
        let file = normalize(join(ROOT, urlPath));
        if (!file.startsWith(ROOT)) { rsp.writeHead(403); rsp.end('forbidden'); return; }
        if (file.endsWith('/') || !existsSync(file)) file = join(file, 'index.html');
        if (!existsSync(file)) { rsp.writeHead(404); rsp.end('not found'); return; }
        const body = await readFile(file);
        rsp.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
        rsp.end(body);
      } catch (e) {
        rsp.writeHead(500); rsp.end(String(e?.message || e));
      }
    });
    server.once('error', rej);
    server.listen(port, () => res(server));
  });
}

export async function runPlay() {
  if (!existsSync(join(ROOT, 'index.html'))) {
    console.error('dev play: index.html not found — run this from the Blade Vale repo root');
    process.exit(1);
  }
  let server, lastErr;
  for (const port of PORTS) {
    try { server = await serve(port); break; } catch (e) { lastErr = e; }
  }
  if (!server) {
    console.error(`dev play: could not bind a local port (${lastErr?.message || 'unknown'})`);
    process.exit(1);
  }
  const url = `http://localhost:${server.address().port}/`;
  console.log('=== Blade Vale ===');
  console.log(`playing at ${url}`);
  console.log('Ctrl+C to stop. Saves live in browser localStorage (bladevale_save_v1).');
  try {
    const { exec } = await import('node:child_process');
    exec(`open "${url}"`, () => {}); // macOS: open default browser; ignore failure
  } catch {}
  await new Promise(() => {}); // hold until Ctrl+C
}
