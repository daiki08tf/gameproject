#!/usr/bin/env node
// Blade Vale remote daemon — runs by the com.daiki-suda.bladevale
// LaunchAgent (installed by `./dev remote start`). Serves the same static
// app as ./dev play, bound to localhost on a fixed port so the Tailscale
// Serve path mount (/bladevale) always has a stable backend.
//
// Never binds 0.0.0.0: the only off-machine door is Tailscale Serve,
// which terminates TLS and is tailnet-only.
import { createStaticServer } from './play.mjs';

const HOST = '127.0.0.1';
const PORT = 8471;
const BASE_PATH = '/bladevale';

const server = createStaticServer({ basePath: BASE_PATH });
server.on('error', (e) => {
  console.error(`bladevale-remote: ${e?.message || e}`);
  process.exit(1); // KeepAlive restarts
});
server.listen(PORT, HOST, () => {
  console.log(`bladevale-remote: listening on http://${HOST}:${PORT}${BASE_PATH}/`);
});
