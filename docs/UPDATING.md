# Updating PetStay Manager

## Normal Update Flow

```bash
# 1. Pull new code (never touches /data)
git pull origin main

# 2. Install new dependencies (if any)
npm run install:all

# 3. Start — migrations run automatically
npm run dev
```

The system detects if `db.json` is outdated and runs the necessary migrations
before starting the server. Existing data is always preserved.

## What if I get a conflict?

A merge conflict happens when you edited a tracked file (outside `/data`) and
the repository also changed that same file.

### Identify conflicts

```bash
git status
# Files marked "both modified" are in conflict
```

### Safest resolution for non-technical users

```bash
# 1. Back up your data first
cp -r backend/data backend/data_backup

# 2. Accept the repository version entirely
git fetch origin
git reset --hard origin/main

# 3. Restore your data
cp -r backend/data_backup/* backend/data/

# 4. Run normally
npm run dev
```

### How to avoid conflicts in the future

Never edit files outside of `backend/data/` directly.
All configuration is done through the Settings panel in the UI.
