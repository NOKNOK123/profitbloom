// Runs ProfitBloom as a normal Node server (local dev, or any host with a disk).
// On Vercel the same app is served by api/index.js instead.
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { app } from './app.js';

const IS_PROD = process.env.NODE_ENV === 'production';
// hosts set PORT for the production server; in dev the API stays on 3001 (Vite proxies /api there)
const PORT = Number(process.env.API_PORT || (IS_PROD && process.env.PORT) || 3001);

const dist = path.resolve(import.meta.dirname, '../dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => console.log(`ProfitBloom API listening on http://localhost:${PORT}`));
