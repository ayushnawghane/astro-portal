# Roadmap

The phase-wise module breakdown from the Software Requirements Proposal (`SRP version 2.pdf`),
reproduced here for tracking against what's actually built in this repo.

Legend: ✅ done · 🚧 partially done · ⬜ not started

---

## Phase 1 — Foundation, SEO & Consultation Platform

> Launch a production-ready platform capable of organic traffic generation, user acquisition,
> consultation monetization, and astrology report generation.

**Status: functionally complete.** Every module below has a working backend and frontend,
verified end-to-end in a real browser (including a live two-party WebRTC voice call with
wallet billing). The remaining gaps are noted explicitly — they're scope simplifications, not
missing features.

| Module | Feature | Backend | Frontend |
|---|---|---|---|
| A | User Management — Mobile OTP login, email register/login, password recovery | ✅ | ✅ |
| A | User Profiles — self/spouse/child/parent/custom, birth details | ✅ | ✅ |
| B | Horoscope Platform — yesterday/daily/weekly/monthly/yearly, lucky attributes, archive | ✅ | 🚧 (sign picker + reading by type; archive *browsing* UI not built, though the API is) |
| C | Panchang Platform — tithi, nakshatra, yoga, karana, rahu kaal, etc. | ✅ | ✅ |
| D | Astrology Tools & Calculators — numerology, zodiac sign & compatibility, tarot | ✅ | ✅ |
| D | Dosha Checkers — Mangal, Kaal Sarp, Pitra | ✅ | ✅ (shown as part of the Kundli page) |
| E | Shubh Muhurat Platform — auspicious dates/timings per activity type | ✅ | ✅ |
| F | Free Kundli — birth chart, planetary positions, dasha, dosha, yoga identification | ✅ (core classical yogas; see note below) | ✅ |
| F | Kundli PDF Export | ✅ | ✅ |
| G | Matchmaking — Ashtakoot (Guna Milan) score, Mangal Dosha comparison | ✅ | ✅ |
| H | Astrology Education Portal — guides on moon signs, remedies, etc. | ✅ | ✅ |
| I | Blog & Content Portal | ✅ | ✅ |
| J | Astrologer Marketplace — discovery, profiles, badge system | ✅ | ✅ |
| K | Consultation System — first chat free, wallet | ✅ | ✅ |
| K | Chat Consultation — real-time chat, billing engine | ✅ | ✅ |
| K | Voice Consultation — browser-based WebRTC calling | ✅ (see note below) | ✅ |
| K | Reviews & Ratings | ✅ | ✅ |
| L | Astrologer Portal — onboarding workflow, dashboard, consultation console | ✅ | ✅ |
| M | Admin Panel — user/astrologer/consultation/wallet/content management, revenue dashboard | ✅ | ✅ |

## Phase 2 — Revenue Expansion & AI Services

> Increase user engagement and create new monetization opportunities.

| Module | Feature | Status |
|---|---|---|
| N | AI Astrology Assistant — chatbot, birth detail analysis, AI Kundli interpretation, voice responses | ⬜ |
| O | Premium Reports — career, marriage, wealth, health, yearly prediction | ⬜ |
| P | Referral Program | ⬜ |
| Q | Loyalty Program | ⬜ |
| R | Subscriptions — monthly/annual plans | ⬜ |
| S | Personalization — recommended astrologers, personalized content/reports | ⬜ |

## Phase 3 — Scale & Engagement

| Feature | Status |
|---|---|
| Browser-based video consultation | ⬜ |
| Live audio sessions (1:1 voice calling is done — this refers to larger/broadcast sessions) | ⬜ |
| Live video sessions | ⬜ |
| Multi-language support (Hindi, Marathi, Gujarati, Tamil, Telugu, Bengali) | ⬜ |
| Business Intelligence — revenue/user/consultation analytics | ⬜ |
| Mobile application preparation (design system + API readiness) | ⬜ |

## Out of scope

- **Phase 4** — Astro StoreFront (explicitly out of scope per the SRP).

---

## Notes on deviations from the SRP

- **Astrology engine**: real Swiss Ephemeris calculations (`sweph`, Moshier mode, Lahiri ayanamsa)
  instead of a stub — see the licensing caveat in [README.md](README.md).
- **Yoga identification** covers 8 well-defined classical yogas (Pancha Mahapurusha ×5,
  Gajakesari, Budhaditya, Chandra-Mangal) computed from real chart data — not the full
  traditional catalog of hundreds of named combinations, which varies by classical text/school.
- **Ashtakoot matchmaking**: 7 of the 8 kootas (Varna, Tara, Yoni, Graha Maitri, Gana, Bhakoot,
  Nadi) use standard, uncontested nakshatra/rashi reference tables. **Vashya** uses a simplified
  4-group model — regional traditions vary here more than the others, so treat that one koota as
  approximate. Dedicated software or a human astrologer may score it slightly differently.
- **Zodiac tools** (`/tools/zodiac`) intentionally use the **Western tropical** system (standard
  Mar 21–Apr 19 = Aries, etc.), separate from the **Vedic sidereal** system used everywhere else
  in the app (Kundli, Horoscope, Panchang). This is a deliberate, common distinction in astrology
  software, not an inconsistency — the tools page is explicitly a lightweight "for fun" calculator.
- **Voice consultation** uses WebRTC with public STUN servers only (no TURN server). This works
  reliably on the same network / most home connections, but calls between users behind strict
  corporate NATs or symmetric NATs may fail to connect in production — a TURN server (e.g. coturn,
  or a hosted service like Twilio) would be needed for full reliability at scale.
- **Payments**: wallet recharge currently simulates a successful capture; no real payment
  gateway (Razorpay/Stripe) is wired in yet.
- **Notifications**: OTP/email/SMS currently log to the server console instead of using
  Amazon SES/SNS.
- **Badge system**: astrologer badges (New/Verified/Expert/Celebrity) are admin-set manually;
  there's no automatic criteria engine (e.g. auto-promoting based on session count or rating).
