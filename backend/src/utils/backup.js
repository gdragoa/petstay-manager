const fs = require('fs');
const path = require('path');
const { DATA_DIR, DB_PATH, assertInsideDataDir } = require('./db');

const BACKUPS_DIR = path.join(DATA_DIR, 'backups');

function backupDb(label) {
  if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  // Label is internal-only (called from code, never from user input)
  const safeLebel = (label || '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
  const fname = safeLebel ? `db_${ts}_${safeLebel}.json` : `db_${ts}.json`;
  const dest = path.join(BACKUPS_DIR, fname);
  assertInsideDataDir(dest);
  fs.copyFileSync(DB_PATH, dest);
  return fname;
}

function listBackups() {
  if (!fs.existsSync(BACKUPS_DIR)) return [];
  return fs
    .readdirSync(BACKUPS_DIR)
    .filter(f => f.endsWith('.json') && !f.includes('..') && !path.isAbsolute(f))
    .sort()
    .reverse()
    .map(fname => {
      const fullPath = path.join(BACKUPS_DIR, fname);
      try { assertInsideDataDir(fullPath); } catch { return null; }
      const stat = fs.statSync(fullPath);
      return { fname, size: stat.size, mtime: stat.mtime.toISOString() };
    })
    .filter(Boolean);
}

function restoreBackup(fname) {
  // Validate path before use
  const src = path.join(BACKUPS_DIR, fname);
  assertInsideDataDir(src);
  if (!fs.existsSync(src)) throw new Error(`Backup not found: ${fname}`);
  backupDb('pre_restore');
  fs.copyFileSync(src, DB_PATH);
  return true;
}

function autoBackup() {
  const backups = listBackups();
  if (backups.length === 0) { backupDb(); return; }
  const hours = (Date.now() - new Date(backups[0].mtime).getTime()) / 3_600_000;
  if (hours >= 24) backupDb();
}

module.exports = { backupDb, listBackups, restoreBackup, autoBackup };
