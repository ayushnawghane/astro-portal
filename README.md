# Astro Portal

Astrology consultation, tools & content platform. This repo implements a trimmed **Phase 1 MVP**
of the full [SRP](.) scope: user auth/profiles, horoscope & panchang content, a real Vedic
birth-chart (Kundli) engine, an astrologer marketplace, wallet-based paid consultations with
real-time chat, and a minimal admin panel. Voice/video calling, matchmaking, the education portal,
blog, badges auto-criteria, and AI features are deferred to a fast-follow phase.

## Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS — `frontend/`
- **Backend**: NestJS, TypeScript (ESM/NodeNext), Prisma ORM 7 — `backend/`
- **Database**: PostgreSQL (via Prisma's `pg` driver adapter)
- **Real-time**: Socket.IO (chat, typing indicators)
- **Astrology engine**: Swiss Ephemeris (`sweph`, Moshier mode — no external ephemeris files needed), Lahiri ayanamsa, whole-sign houses, Vimshottari dasha

## Getting started

### 1. Database

The backend needs a Postgres instance. Easiest option — Prisma's built-in local dev database
(no Docker/Postgres install required):

```bash
cd backend
npx prisma dev -d      # starts a local Postgres in the background, prints a connection string
```

Copy the printed connection string into `backend/.env` as `DATABASE_URL` (see `.env.example`).
To stop it later: `npx prisma dev stop`. To use a real Postgres instance (including Amazon Aurora
PostgreSQL in production) instead, just point `DATABASE_URL` at it.

### 2. Backend

```bash
cd backend
cp .env.example .env    # then fill in DATABASE_URL from step 1
npm install
npx prisma migrate dev  # applies the schema
npm run start:dev       # http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:3000
```

## What's implemented (Phase 1 MVP)

| Module | Notes |
|---|---|
| Auth | Email register/login, phone OTP register/login, password reset, JWT |
| Profiles | Self/spouse/child/parent/custom, birth details |
| Horoscope | Daily/weekly/monthly/yearly/yesterday, public reads, admin content CRUD, archive |
| Panchang | Tithi/nakshatra/yoga/karana/rahu kaal etc., public reads, admin CRUD |
| Kundli | Real Swiss Ephemeris chart: planets, houses, nakshatras, Vimshottari dasha, Mangal & Kaal Sarp dosha checks, PDF export |
| Astrologer Marketplace | Apply/onboard, search/filter, badges, admin approval |
| Wallet | Balance, recharge (simulated capture), transaction history |
| Consultations | Request → accept/reject → live chat (WebSocket) → end → billed from wallet; first chat free; post-session reviews |
| Admin | User/astrologer/consultation listings, wallet transaction log, revenue dashboard |

## Known gaps / follow-ups (deliberately out of scope for this pass)

- **Yoga identification** (the hundreds of classical planetary-combination rules) and
  **Pitra Dosha** are not implemented — `KundliReport.yogas` is currently always empty.
- **Payment gateway**: wallet recharge currently simulates a successful capture. Swap in
  Razorpay/Stripe before accepting real money (`backend/src/wallet/wallet.service.ts`).
- **Voice/video calling, matchmaking, education portal, blog, referral/loyalty/subscriptions,
  AI assistant**: SRP Phase 2/3 modules, not built yet.
- **File storage (S3), SES/SNS**: notifications currently log to the server console
  (`backend/src/notifications/notification.service.ts`) instead of sending real email/SMS.
- **Timezone default**: Kundli generation defaults to `Asia/Kolkata` if a profile has no
  timezone set — set `Profile.timezone` (IANA name) explicitly for accurate charts elsewhere.
- **`sweph` license**: the Swiss Ephemeris bindings are dual-licensed AGPL-3.0-or-later /
  LGPL-3.0-or-later. Running it as-is on a closed-source commercial backend likely requires
  either complying with LGPL terms or purchasing a commercial Swiss Ephemeris license from
  Astrodienst before launch — this needs a legal/licensing decision before production.
