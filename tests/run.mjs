// Starts the API on a temporary database, runs the end-to-end checks, then cleans up.
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'profitbloom-test-'));
const port = 4321;
const env = { ...process.env, DATA_DIR: dataDir, API_PORT: String(port), NODE_ENV: 'test' };

const server = spawn(process.execPath, ['server/index.js'], { cwd: root, env, stdio: 'ignore' });
let code = 1;
try {
  for (let i = 0; i < 50; i++) {
    try {
      await fetch(`http://localhost:${port}/api/auth/me`);
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  code = spawnSync(process.execPath, ['tests/api.e2e.mjs'], {
    cwd: root,
    env: { ...env, BASE: `http://localhost:${port}`, PROJECT_DIR: root },
    stdio: 'inherit',
  }).status;
} finally {
  server.kill();
  fs.rmSync(dataDir, { recursive: true, force: true });
}
process.exit(code ?? 1);
