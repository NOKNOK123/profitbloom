import { createClient } from '@libsql/client';
import { AsyncLocalStorage } from 'node:async_hooks';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Database access.
 * - On Vercel: Turso (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN), a hosted SQLite.
 * - Locally: the SQLite file in DATA_DIR (default ./data/profitbloom.db).
 * Both speak the same SQL, so the rest of the server doesn't care which one it talks to.
 */
function connect() {
  if (process.env.TURSO_DATABASE_URL) {
    return createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  }
  const dataDir = process.env.DATA_DIR || path.resolve(import.meta.dirname, '../data');
  fs.mkdirSync(dataDir, { recursive: true });
  return createClient({ url: `file:${path.join(dataDir, 'profitbloom.db')}` });
}

const client = connect();
// inside transaction(), statements run on the transaction instead of the shared client
const txStore = new AsyncLocalStorage();
const runner = () => txStore.getStore() ?? client;

/** Same shape as the old synchronous API (prepare → get/all/run), but async. */
export const db = {
  prepare(sql) {
    const exec = (args) => runner().execute({ sql, args: args.map((a) => (a === undefined ? null : a)) });
    return {
      get: async (...args) => {
        const rs = await exec(args);
        return rs.rows[0] ? { ...rs.rows[0] } : undefined;
      },
      all: async (...args) => (await exec(args)).rows.map((r) => ({ ...r })),
      run: async (...args) => {
        const rs = await exec(args);
        return { changes: rs.rowsAffected, lastInsertRowid: rs.lastInsertRowid === undefined ? undefined : Number(rs.lastInsertRowid) };
      },
    };
  },
  exec: (sql) => runner().executeMultiple(sql),
};

export async function transaction(fn) {
  const tx = await client.transaction('write');
  try {
    const result = await txStore.run(tx, fn);
    await tx.commit();
    return result;
  } catch (err) {
    await tx.rollback().catch(() => {});
    throw err;
  } finally {
    tx.close();
  }
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    business_name    TEXT NOT NULL DEFAULT '',
    business_address TEXT NOT NULL DEFAULT '',
    business_phone   TEXT NOT NULL DEFAULT '',
    business_tax_id  TEXT NOT NULL DEFAULT '',
    business_logo    TEXT NOT NULL DEFAULT '',
    plan             TEXT NOT NULL DEFAULT 'trial',
    trial_ends_at    TEXT,
    role             TEXT NOT NULL DEFAULT 'shop',
    disabled         INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code          TEXT NOT NULL,
    title         TEXT NOT NULL,
    project_type  TEXT NOT NULL,
    client        TEXT NOT NULL DEFAULT '',
    phone         TEXT NOT NULL DEFAULT '',
    email         TEXT NOT NULL DEFAULT '',
    event_date    TEXT,
    budget        REAL NOT NULL DEFAULT 0,
    notes         TEXT NOT NULL DEFAULT '',
    status        TEXT NOT NULL DEFAULT 'draft',
    profit_margin REAL NOT NULL DEFAULT 30,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cost_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name       TEXT NOT NULL DEFAULT '',
    quantity   REAL NOT NULL DEFAULT 0,
    price      REAL NOT NULL DEFAULT 0,
    sort       INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS quotes (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code          TEXT NOT NULL,
    project_id    INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    client_name   TEXT NOT NULL DEFAULT '',
    client_phone  TEXT NOT NULL DEFAULT '',
    client_email  TEXT NOT NULL DEFAULT '',
    project_title TEXT NOT NULL DEFAULT '',
    event_date    TEXT,
    valid_until   TEXT,
    notes         TEXT NOT NULL DEFAULT '',
    tax_rate      REAL NOT NULL DEFAULT 7,
    discount_rate REAL NOT NULL DEFAULT 0,
    status        TEXT NOT NULL DEFAULT 'draft',
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS quote_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id    INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    description TEXT NOT NULL DEFAULT '',
    quantity    REAL NOT NULL DEFAULT 0,
    unit_price  REAL NOT NULL DEFAULT 0,
    sort        INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS activities (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind       TEXT NOT NULL,
    title      TEXT NOT NULL,
    detail     TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
  CREATE INDEX IF NOT EXISTS idx_quotes_user ON quotes(user_id);
  CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id, created_at);
`;

// columns added after the first release; add them to databases created before
const MIGRATIONS = [
  ['users', 'business_logo', "TEXT NOT NULL DEFAULT ''"],
  ['users', 'plan', "TEXT NOT NULL DEFAULT 'trial'"],
  ['users', 'trial_ends_at', 'TEXT'],
  ['users', 'role', "TEXT NOT NULL DEFAULT 'shop'"],
  ['users', 'disabled', 'INTEGER NOT NULL DEFAULT 0'],
  // the shop's business rules for the decision engine (JSON, empty = defaults)
  ['users', 'rules', "TEXT NOT NULL DEFAULT ''"],
  // job conditions used by Job Health Check / Quote Health Check
  ['projects', 'deposit_pct', 'REAL NOT NULL DEFAULT 30'],
  ['projects', 'setup_days', 'REAL NOT NULL DEFAULT 1'],
  ['projects', 'event_days', 'REAL NOT NULL DEFAULT 1'],
  ['projects', 'labor_days', 'REAL'],
  ['projects', 'team_size', 'REAL'],
  ['projects', 'owner_labor', 'INTEGER'],
  ['projects', 'teardown', 'INTEGER'],
  // post-event review
  ['projects', 'review_applied', 'INTEGER NOT NULL DEFAULT 0'],
  ['projects', 'reviewed_at', 'TEXT'],
  // estimated vs actual
  ['cost_items', 'category', "TEXT NOT NULL DEFAULT 'material'"],
  ['cost_items', 'paid_before', 'INTEGER NOT NULL DEFAULT 1'],
  ['cost_items', 'actual', 'REAL'],
  ['cost_items', 'is_extra', 'INTEGER NOT NULL DEFAULT 0'],
];

/** Creates/updates the schema once per process (cold start). */
export const ready = (async () => {
  await client.executeMultiple(SCHEMA);
  for (const [table, column, type] of MIGRATIONS) {
    const exists = await db.prepare(`SELECT 1 FROM pragma_table_info('${table}') WHERE name = ?`).get(column);
    if (!exists) await client.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
  // plans were renamed to match the public website (Free Trial / Starter / Pro)
  await client.executeMultiple(`
    UPDATE users SET plan = 'starter' WHERE plan = 'basic';
    UPDATE users SET plan = 'pro' WHERE plan = 'enterprise';
  `);
})();
