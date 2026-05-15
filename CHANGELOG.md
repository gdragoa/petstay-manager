# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com).

## [1.0.0] - 2026-05-11

### Added
- Initial release
- Tutor and animal registration
- Booking management with check-in/check-out flow
- Digital contract generation with unique token
- Canvas-based digital signature (mobile-first)
- SHA-256 authenticity hash + local QR Code
- Draft PDF (watermark) and final PDF (signature + QR Code)
- PT/EN bilingual interface
- Dark/Light mode
- Versioned migration system
- Automatic daily backup of db.json

### Migration
- v1.0.0.js: initial schema — tutors, animals, bookings, contracts, services, blocked_dates
