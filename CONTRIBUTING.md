# Contributing to PetStay Manager

## Schema Changes — Migration Required

Any PR that changes the `db.json` schema MUST:

1. Create `/backend/src/migrations/vX.Y.Z.js`
2. Register it in `migrations/index.js` (in order)
3. Update `APP_VERSION` in `migrations/index.js`
4. Add an entry to `CHANGELOG.md`
5. Always use spread `{ ...existingData }` to preserve existing fields

## Adding Translations

Add keys to both `frontend/src/i18n/pt.ts` and `frontend/src/i18n/en.ts`.
Never hardcode strings in components — always use `t('key')`.

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org):

```
feat: add vaccination upload to animal profile
fix: prevent canvas scroll on iOS Safari
docs: update UPDATING.md with conflict resolution
migration: add observacoes field to bookings (v1.1.0)
```

## Opening a PR

1. Branch from `main`
2. Run `npm run install:all` and test `npm run dev`
3. If schema changed, include migration script
4. Fill PR description with what changed and why
