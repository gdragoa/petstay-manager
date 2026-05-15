# PetStay Manager

Open source pet hotel management system. Clone it, run it, own your data.

No cloud subscriptions. No external APIs. All data stays on your machine.

---

## Features

- **Reservations** — multi-step booking flow with check-in/check-out management
- **Tutors & Animals** — full registration with vaccination file uploads
- **Digital Contracts** — auto-generated PDF with unique token per booking
- **Digital Signatures** — mobile-first canvas (touch + mouse + retina support)
- **Authenticity Verification** — SHA-256 hash + QR Code on every signed contract
- **Dashboard** — KPIs and occupancy overview
- **Calendar** — visual availability and blocked dates
- **Services** — configurable services and pricing
- **Settings & Onboarding** — hotel branding, name, logo
- **Bilingual** — Portuguese and English interface
- **Dark / Light mode**
- **Versioned migrations** — schema updates never corrupt existing data
- **Automatic daily backup** — `db.json` backed up automatically

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js 18+ · Express · PDFKit · QRCode |
| Frontend | React 18 · Vite · TypeScript · Tailwind CSS v3 |
| Storage | Local `db.json` (no database required) |
| Auth | None (single-tenant, local network) |

---

## Requirements

- Node.js 18 or higher
- npm 9 or higher
- Git

---

## Installation

```bash
# Clone the repository
git clone https://github.com/Viniciusap/petstay-manager.git
cd petstay-manager

# Install all dependencies (root + backend + frontend)
npm run install:all

# Copy environment file and adjust if needed
cp .env.example .env

# Start both servers
npm run dev
```

- Backend: http://localhost:3001
- Frontend: http://localhost:5173

On first run, migrations execute automatically and create `/backend/data/db.json`.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Backend port |
| `FRONTEND_URL` | `http://localhost:5173` | CORS allowed origin |
| `NODE_ENV` | `development` | Environment |

---

## Project Structure

```
petstay-manager/
├── backend/
│   └── src/
│       ├── routes/         # REST API endpoints
│       ├── middleware/      # Validation, error handling, CORS
│       ├── migrations/      # Versioned schema migrations
│       └── utils/           # PDF, backup, hash, db helpers
├── frontend/
│   └── src/
│       ├── components/      # UI design system + signing canvas
│       ├── pages/           # All app pages
│       ├── contexts/        # Theme, Toast, Translation
│       └── i18n/            # PT and EN translation files
├── docs/                    # Extra documentation
├── .env.example
├── CHANGELOG.md
└── CONTRIBUTING.md
```

> `backend/data/` is listed in `.gitignore` and never committed — your data stays local.

---

## Updating

```bash
# Pull new code (never touches /backend/data)
git pull origin main

# Install any new dependencies
npm run install:all

# Restart — migrations run automatically
npm run dev
```

Schema migrations are versioned and incremental. Existing data is always preserved.

---

## How the Signing Flow Works

1. Booking created → contract token generated
2. Admin shares signing link with tutor (e.g. via WhatsApp)
3. Tutor opens link on mobile → reads contract → signs on canvas
4. Signature saved as PNG → final PDF generated with signature + QR Code
5. SHA-256 hash stored for authenticity verification
6. Anyone can verify a contract at `/verify/:token`

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

**Quick rules:**
- Any `db.json` schema change requires a migration in `/backend/src/migrations/`
- All UI strings must use `t('key')` — no hardcoded text in components
- Follow [Conventional Commits](https://www.conventionalcommits.org)
- Branch from `main`, open a PR with description of what changed and why

---

## Data & Privacy

All data is stored locally in `/backend/data/db.json`. Nothing is sent to external servers. Each hotel instance is fully independent.

Uploaded files (vaccination proofs, signatures, PDFs) are stored in `/backend/data/uploads/` and `/backend/data/pdfs/`.

---

## License

MIT — free to use, modify, and distribute.
