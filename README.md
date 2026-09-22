# Astro Portal

Astrology consultation, tools & content platform. This repo implements the full **Phase 1**
scope from the [SRP](.): user auth/profiles, horoscope/panchang/muhurat content, a real Vedic
birth-chart (Kundli) engine, astrology calculators, Ashtakoot matchmaking, a blog & education
portal, an astrologer marketplace, wallet-based paid consultations with real-time chat **and**
WebRTC voice calling, and a full admin panel. AI features, premium reports, referrals/loyalty/
subscriptions, and multi-language support (SRP Phase 2/3) are deferred to a fast-follow phase.

See [ROADMAP.md](ROADMAP.md) for the full phase-by-phase module breakdown from the SRP,
what's implemented, and the specific simplifications/known gaps in each module.

## Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS — `frontend/`
- **Backend**: NestJS, TypeScript (ESM/NodeNext), Prisma ORM 7 — `backend/`
- **Database**: PostgreSQL (via Prisma's `pg` driver adapter)
- **Real-time**: Socket.IO (chat, typing indicators, WebRTC signaling)
- **Voice calling**: WebRTC (browser-to-browser, public STUN servers)
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
npm run build && npm run db:seed  # optional: sample content + demo accounts (see below)
npm run start:dev       # http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:3000
```

### Demo accounts (after running `db:seed`)

| Role | Email | Password |
|---|---|---|
| Astrologer (pre-approved, chat + voice) | `demo.astrologer@example.com` | `astrologer123` |
| Admin | `admin@example.com` | `admin123456` |

Dev-only — these exist so you can exercise the astrologer console and admin panel
without manually approving accounts. Don't reuse these credentials anywhere real.

## What's implemented (Phase 1 — complete)

| Module | Notes |
|---|---|
| Auth | Email register/login, phone OTP register/login, password reset, JWT |
| Profiles | Self/spouse/child/parent/custom, birth details |
| Horoscope | Daily/weekly/monthly/yearly/yesterday, public reads, admin content CRUD, archive API |
| Panchang | Tithi/nakshatra/yoga/karana/rahu kaal etc., public reads, admin CRUD |
| Shubh Muhurat | Auspicious dates/timings by activity type (marriage, griha pravesh, etc.), admin CRUD |
| Kundli | Real Swiss Ephemeris chart: planets, houses, nakshatras, Vimshottari dasha, Mangal/Kaal Sarp/Pitra dosha checks, 8 classical yogas, PDF export |
| Matchmaking | Full 8-koota Ashtakoot (Guna Milan) scoring + Mangal Dosha comparison between two saved profiles |
| Astrology Tools | Numerology (Life Path/Destiny/Soul Urge), Western zodiac sign + compatibility, tarot (Major Arcana, single & 3-card spreads) |
| Blog & Education | CMS-backed articles, public reads, admin CRUD + publish toggle |
| Astrologer Marketplace | Apply/onboard, search/filter, badges, admin approval |
| Wallet | Balance, recharge (simulated capture), transaction history |
| Consultations | Request → accept/reject → live chat (WebSocket) or live voice call (WebRTC) → end → billed from wallet; first chat free; post-session reviews |
| Admin | User/astrologer/consultation/wallet management, horoscope/panchang/muhurat/content management, revenue dashboard |

Every row above has a working, browser-tested frontend — see [ROADMAP.md](ROADMAP.md) for the
exact backend-vs-frontend breakdown and the specific simplifications in each module (e.g. which
yogas are covered, why the Ashtakoot Vashya koota is approximate, WebRTC's STUN-only limitation).

## Known gaps / follow-ups (SRP Phase 2/3 — deliberately out of scope for this pass)

- **AI Astrology Assistant, Premium Reports, Referral/Loyalty/Subscriptions, Personalization**
  (SRP Phase 2) and **live audio/video sessions, multi-language support, BI analytics, mobile app
  prep** (SRP Phase 3) are not built.
- **Payment gateway**: wallet recharge currently simulates a successful capture. Swap in
  Razorpay/Stripe before accepting real money (`backend/src/wallet/wallet.service.ts`).
- **File storage (S3), SES/SNS**: notifications currently log to the server console
  (`backend/src/notifications/notification.service.ts`) instead of sending real email/SMS.
- **TURN server**: voice calls use STUN only — see the WebRTC note in ROADMAP.md.
- **Timezone default**: Kundli generation defaults to `Asia/Kolkata` if a profile has no
  timezone set — set `Profile.timezone` (IANA name) explicitly for accurate charts elsewhere.
- **`sweph` license**: the Swiss Ephemeris bindings are dual-licensed AGPL-3.0-or-later /
  LGPL-3.0-or-later. Running it as-is on a closed-source commercial backend likely requires
  either complying with LGPL terms or purchasing a commercial Swiss Ephemeris license from
  Astrodienst before launch — this needs a legal/licensing decision before production.
