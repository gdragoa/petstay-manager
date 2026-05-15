# Migrations

## How the system works

On every startup, `runMigrations()` compares `db.version` with `APP_VERSION`.
If they differ, it backs up `db.json` and runs all pending migrations in order.

## Creating a new migration

**1. Create the migration file:**

```js
// backend/src/migrations/v1.1.0.js
module.exports = async function migrate_v1_1_0(readDb, writeDb) {
  const db = readDb();

  // Add new field to existing records — always with a safe default
  db.bookings = db.bookings.map(b => ({
    observacoes: '',   // new field
    ...b              // existing fields win (idempotent)
  }));

  writeDb(db);
};
```

**2. Register in index.js:**

```js
const migrations = [
  { version: '1.0.0', run: require('./v1.0.0') },
  { version: '1.1.0', run: require('./v1.1.0') }, // ← add here
];
```

**3. Update APP_VERSION:**

```js
const APP_VERSION = '1.1.0';
```

**4. Update CHANGELOG.md.**

## Rules

- Migrations are **idempotent** — safe to run twice
- Always use spread `{ newField: default, ...existingRecord }` so existing data wins
- Never delete fields without a deprecation migration first
- A pre-migration backup is created automatically before any migration runs
