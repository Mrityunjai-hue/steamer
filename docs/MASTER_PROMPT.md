# Steamer — MASTER BUILD PROMPT v1.0

**Project layout.** Place the three files in the repo and read ALL of them before writing code:
- `/docs/MASTER_PROMPT.md` (this file)
- `/docs/legal/LEGAL_AND_POLICIES.md` (Terms, Disclosure, Plan Conditions, Guidelines, Privacy, Community Rules; render these as versioned pages)
- `/data/catalog_seed.csv` (245 titles with tier, price, tags, launcher)

The brand name is **Steamer**. Replace every remaining `[PLACEHOLDER]` (business name, city, emails, grievance officer) from a single `config/brand.ts` and an admin settings screen.

---

## 0. GROUND RULES FOR THE BUILDER
1. You are a senior full-stack engineer and security architect. Think through bottlenecks, race conditions and abuse cases before coding. Deliver complete, working code. No stubs or "TODO" in core flows.
2. Build in the phases in section 15. After each phase, list known risks and how they were mitigated.
3. Never hardcode secrets. Never log secrets. Never put real Steam credentials anywhere in the repo, database seed, tests or chat.
4. Do NOT use Steam's/Valve's logo, name or trademarks. The look is Steam-INSPIRED and the brand is original.
5. Do NOT build features that help evade a platform's detection (IP masking, VPN rotation, fingerprint spoofing, automated Steam login, shared-secret storage). If a requirement seems to need that, stop and flag it instead.
6. Do NOT automate WhatsApp with unofficial libraries. Credential delivery is manual by the admin (section 4).

---

## 0A. BRAND RULES
- Brand name: **Steamer**. Use it consistently in the UI, emails, legal pages, metadata and page titles; read it from `config/brand.ts`.
- **Logo:** create an ORIGINAL mark for Steamer (for example a controller, a vault, or a play button in a shield). Do NOT use, trace, recolor or derive anything from Valve's Steam logo, icons, wordmark or other assets. Ship the logo as an SVG in `/public/brand/` with a simple wordmark.
- Keep the "not affiliated with, endorsed by or sponsored by Valve or Steam" disclaimer in the footer, Terms and checkout.
- The site must never describe itself as Steam, an official Steam service, or a Steam partner. Do not use "Steam" as a prefix or part of the product name in navigation, page titles or marketing copy; use it only to describe the platform games run on (for example "Steam Offline Mode").

---

## 1. PRODUCT SUMMARY
A web platform ("Steamer") that rents time-limited access to games on a dedicated, separate business Steam account (never the owner's personal account). Core ideas:
- **Catalog-based:** ~245 games (no cap), each with a hype tier and a monthly rent price shown under the game art, plus the Steam store price for comparison.
- **Plans:** single game, 2-game bundle, 3-game bundle, multi-game bundle, and All-Access (₹300/month). Monthly only, 30 days, manual renewal.
- **Slot-limited, first come first served:** only N active renters at once. Live counter "X of Y slots left". Waitlist when full.
- **Offline-only play:** every renter must set Steam to Offline Mode before launching any game. Online multiplayer is not supported. This is disclosed and consented to BEFORE payment.
- **Trust-first:** plans are not technically locked. The product says so openly ("Built on Trust"), records a Trust Pledge, and relies on a strike system.
- **WhatsApp-only credentials:** the platform never displays or stores passwords or Steam Guard codes. The admin relays them manually on WhatsApp.
- **Community hub:** forum, per-game threads, chat, guides, support tickets.
- **Admin-only registry:** who has which plan, which games, which device, days left.

Roles: **Renter** and **Admin** (single owner, separate hardened login).

---

## 2. TECH STACK
- Next.js (App Router) + TypeScript, Tailwind CSS, shadcn/ui as a base (restyled to the design system in section 12)
- PostgreSQL + Prisma; Redis (cache, rate limits, locks, sessions); BullMQ (jobs)
- Socket.io (chat, live admin counters)
- Razorpay (UPI/cards) with signed webhooks; idempotency keys
- Email via a transactional provider; WhatsApp OTP for number verification via the official WhatsApp Business Cloud API or an SMS/WhatsApp OTP provider (OTP only, no content relay)
- Docker, deploy behind Cloudflare (WAF, DDoS, Turnstile); HTTPS only
- Sentry-style error tracking, structured logs (pino), uptime monitoring, health checks

---

## 3. ACCESS MODEL (READ CAREFULLY)

### 3.1 Why this needs "setup windows"
A Steam account can only be ONLINE on one device at a time; a second online login kicks the first. Offline Mode lets a client keep playing without being online. Games must be downloaded and updated while ONLINE. Therefore:

- **Setup Window:** a time-boxed, exclusive slot in which exactly ONE renter is allowed to be online on the account (first login, game download, updates, Steam Guard). Default max 3 hours (admin-configurable, extendable by admin for very large downloads).
- **Offline play:** after setup, the renter switches Steam to Offline Mode and plays without any window.
- Setup windows are scheduled FCFS through a queue. The renter requests a window, sees queue position and estimated start, and gets a WhatsApp-task notification sent to the ADMIN (not the renter) when their turn starts.
- At the end, the renter presses "I am now in Offline Mode" (with a checklist). The window closes. Missing the confirmation after the timer ends triggers an admin task: "Window expired, confirm renter is offline".
- Only ONE window can be open at any time. Enforce with a Redis lock plus a DB constraint (partial unique index on open windows). No race conditions.

### 3.2 Grants and devices
- **Grant** = authorization for one renter's device for the plan period (fields: userId, subscriptionId, deviceLabel, issuedAt, expiresAt, status).
- One device per renter by default. A device change needs admin approval, max 1 change per plan cycle (configurable).
- Admin-configurable capacity controls (enforced server-side):
  - `max_active_renters` (default 8)
  - `max_new_renters_per_month` (default 8)
  - `max_setup_windows_per_day` (default 2)
  - `setup_window_max_minutes` (default 180)
  - `onboarding_paused` master switch
- A warning-signs checklist on the admin dashboard (Steam Guard alert emails, unusual-login emails, feature restrictions, Steam Support message, several renters reporting logouts). Ticking any item auto-enables `onboarding_paused`.

### 3.3 Presence alert (best-effort)
Poll the Steam Web API `GetPlayerSummaries` for the business account every 60 seconds (cached, with backoff). If the account appears ONLINE or in-game while NO setup window is open, create a high-priority admin alert ("Someone is online outside a setup window"). Show an admin health check explaining that this depends on the profile's visibility settings and cannot see offline play.

### 3.4 Monitoring policy
- Default: Renter Registry only (name, device label, plan, games bought, start/end, days left, last credential relay time).
- Optional toggle, default OFF: playtime-diff audit (every few hours via `GetOwnedGames` / `GetRecentlyPlayedGames`), flagging games with playtime growth that no active renter bought. UI label: "Delayed and probabilistic. A support tool, never an automatic ban."
- Never build screen capture, keyloggers, file scanning or hidden companions.

---

## 4. CREDENTIAL DELIVERY (WHATSAPP ONLY, MANUAL)
- The platform NEVER displays, stores, emails or posts in chat any password or Steam Guard code.
- When a setup window starts, the admin sees a task card: renter name, masked number, game(s), timer, a "Open WhatsApp" button (`wa.me` link with a pre-filled template containing NO secrets), and a checklist: "Credentials sent → code sent (if asked) → renter confirmed → renter confirmed Offline Mode → done".
- Log metadata only (grant/window id, time, admin id). Never message content.
- Require a verified WhatsApp number at signup (OTP).
- Expiry task for admin when a plan ends: "Rotate Steam password and sign out of all other devices" with a runbook note that revocation only takes effect when a client next connects.

---

## 5. CATALOG, PRICING AND IMAGES

### 5.1 Seed
- Import `/data/catalog_seed.csv` via an admin-reviewed matching step (title → Steam appid using the Steam Store search; show a review table with confidence; unmatched titles are flagged, never silently dropped). Group by `series`.
- Game fields: title, series, hypeTier (Hot/Popular/Standard/Budget), ourMonthlyPriceINR (derived from tier, overridable per game via `priceOverride`), offlineTag (`Unverified` | `Offline OK` | `Mixed` | `Online required`), suggestedOfflineTag, testedOfflineOn (date), launcher (Steam only / Ubisoft Connect / EA app / Rockstar Games Launcher), purchasableAsSingle, steamAppId, steamPriceINR, adminNote, releaseDate, genres, tags.
- **"Offline OK" badge may be shown ONLY if `testedOfflineOn` is set.** Otherwise show "Not yet verified".
- `Online required` titles: `purchasableAsSingle = false`; hide them by default behind an "Online-only (not supported)" filter with a clear label; they cannot be chosen in a bundle.

### 5.2 Tier prices (admin-editable, apply to NEW purchases only)
| Tier | Rent per month |
|---|---|
| Hot | ₹99 |
| Popular | ₹79 |
| Standard | ₹59 |
| Budget | ₹39 |

### 5.3 Pricing function (server-side, single source of truth; the client only displays it)
```
price(selection):
  n = number of selected games, sum = Σ individual prices
  cap = n==1: none | n==2: 149 | n==3: 199 | n>=4: 300
  p = min(sum, cap)
  if p == 300 or n >= 6: convert to ALL_ACCESS at 300
  return p
```
- The cart shows live total, "You saved ₹X" (vs the sum), a nudge "Add one more game for the same price" when within one game of a cap, and "All-Access is better value" when relevant.
- Selected games are locked for the 30-day cycle; one free swap per cycle (configurable).
- All-Access = every game marked purchasable, for ₹300.
- Prices are static DB fields; NO per-request Steam API calls.

### 5.3a Showing "Steam price vs our price"
On each card and game page show two lines: **"Steam price (to own): ₹X"** (from Steam Store `appdetails` with `cc=in`, cached, refreshed nightly by a BullMQ job with throttling) and **"Rent: ₹Y / month"** (large, green). If the Steam price is unavailable or the game is delisted, show "—". Never hardcode Steam prices.

### 5.4 Cover art (official art, not re-hosted)
- Use the image URLs returned by the Steam Store API (`header_image`, and library capsule/hero images where available) keyed by `steamAppId`. Fallback pattern: `https://cdn.cloudflare.steamstatic.com/steam/apps/{appid}/header.jpg` and `library_600x900.jpg`.
- Hotlink only. Do NOT download, store or re-host publisher artwork. Allow these hosts in `img-src` of the CSP. Use `loading="lazy"`, fixed aspect ratios, blur-up placeholders.
- If an image fails, render a generated fallback card (tier-coloured gradient with the title) so the layout never breaks.
- Footer line on every page that shows art: "Game images and trademarks belong to their respective owners." Add a takedown contact in Terms and footer.
- Privacy Policy must disclose that image loading contacts a third-party CDN (included in the legal pack).

### 5.5 Catalog performance
Server-side pagination (24/page) or infinite scroll, search (Postgres full-text or Meilisearch), filters (series, tier, price, launcher, offline tag, genre, new), sort (hype, price, recently added, A–Z), Redis-cached queries, indexes on every filter field, CDN for static assets. Nightly sync job for metadata; admin bulk import by appid list or CSV.

---

## 6. PURCHASE FLOW (EVERY STEP ENFORCED SERVER-SIDE)
1. Browse → add games to cart or pick All-Access.
2. **Slot reservation:** on "Checkout", atomically reserve a slot with a 10-minute hold (DB transaction + Redis lock; no overselling). If payment isn't completed, the hold releases to the next person.
3. **"Read before you buy" panel** (text in the legal pack, section B): separate unticked checkboxes for every point, then the **Trust Pledge** checkbox, then a final "I understand and accept". For games with launcher ≠ Steam, Mixed, or Unverified tags, add per-game acknowledgments.
4. Server stores a **ConsentRecord** (userId, planId, disclosureVersion, termsVersion, checkbox states, timestamp, IP, user agent). Payment creation is rejected without a valid record for the CURRENT versions.
5. Razorpay payment. Plan status changes ONLY after a verified, signed webhook (idempotent). Never trust the client.
6. Activation → email copy of accepted terms → onboarding wizard (section 7) → request first setup window.
7. **Waitlist:** when slots hit 0, "Buy" becomes "Join waitlist" (FCFS). When a slot opens, notify the next person (email + admin sends WhatsApp), 24-hour claim window, then pass to the next.
8. **Renewal:** existing renters get a priority window in the last 5 days of their plan. Renewal is manual (no auto-debit).
9. **Expiry:** enforced by a BullMQ job; frees the slot, revokes the grant, creates the admin rotate-password task.
10. **Homepage counter:** "X of Y slots left this month", cached for a few seconds.

---

## 7. MANDATORY ONBOARDING WIZARD (before the first setup window)
Steps with screenshots/GIFs and a tick box per step (text in the legal pack, section D): log in once, enable "Remember my password", download only your games, switch to Offline Mode BEFORE launching, never click Go Online, never change account details, don't add friends or use Steam community/market/wallet, one device only, play only your plan's games, back up saves. Store acceptance (version, timestamp, IP). Re-accept whenever the guidelines version changes.

---

## 8. USER-FACING PAGES
- **Store (home):** hero carousel (Hot this month, New additions), slot counter, "Built on Trust" banner, rows by tier and by series, Offline-OK-verified row, All-Access promo.
- **Catalog:** filter sidebar + game grid. Each card: art, title, tier badge, launcher badge, offline badge, Steam price, rent price.
- **Game page:** header art, description, genres, tags, system requirements link, offline/launcher notes, price box (rent price, Steam price, savings badge, "Add to plan"), "Discussion" tab linked to the game's thread, similar games from the same series.
- **Cart/Checkout:** as in section 6.
- **Dashboard (Library):** plan card with circular days-left countdown, expiry date, games in plan, swap button, renewal button (shown in the last 5 days), payment history, device label, status of setup window, "Request setup window" button, guideline acknowledgment status, strike history.
- **My Games:** game grid with offline notes, launcher notes and per-game "How to install and play offline" help.
- **Setup Window page:** queue position, countdown, checklist, "I am now in Offline Mode" button.
- **Guidelines page**, **Terms**, **Privacy**, **Plan Conditions**, **Community Rules** (versioned).
- **Support:** tickets with categories (login help, offline mode, game crash, billing).
- **Profile/Security:** 2FA (TOTP), verified WhatsApp number, data export, account deletion request.

---

## 9. ADMIN PANEL (separate route, own session policy)
- **Dashboard:** slots used/total, pending setup-window queue, active window timer, presence alerts, expiring in 5 days, revenue this month, onboarding paused toggle, warning-signs checklist.
- **Renter Registry:** name, masked WhatsApp, plan type, games purchased, device label, start date, expiry date, days left, last credential relay time, status (active / expiring / expired / suspended). Search, filters, CSV export.
- **Games-in-Use view:** per game, the renters who bought it.
- **Catalog manager:** bulk edit tier/price/offline tag/launcher, "mark tested offline" with date and note, image health check, CSV import/export, appid matching review.
- **Plans, pricing and coupons**, **slot and capacity controls**, **waitlist manager**.
- **Setup-window console:** start/extend/close a window, send-via-WhatsApp task cards, confirmation checklist.
- **Violations:** strike system (warn → 7-day suspension → permanent ban), evidence view, one-click suspend/revoke/flag-for-rotation. Optional playtime audit view (OFF by default).
- **Content:** guidelines, terms, announcements (versioned, with forced re-acceptance).
- **Analytics:** revenue, conversion, popular games, churn, renewals.
- **Account-lost playbook:** one click that pauses sales, shows a WhatsApp broadcast task list for active renters, applies the credit/refund rule from the Plan Conditions, and exports renter and plan data.
- **Audit log** of every admin action (immutable, append-only).

---

## 10. COMMUNITY / VERIFICATION HUB
- Forum categories: Announcements, Setup Help, Offline Mode Help, Game Help (per-game threads), Requests (game requests), General.
- Real-time chat rooms, direct messages, reactions, pinned guides, "Verified Renter" badge.
- Moderation: report, mute, ban, delete, slow mode, profanity/spam filter, link filter, per-user rate limits. Admin and appointed moderators.
- NEVER allow credentials, codes or screenshots of Steam Guard in community content. Auto-detect patterns (e.g. 5-character Steam Guard codes next to the words "code" / "guard") and block with a warning.
- Access: verified users with active or recently expired (≤14 days) plans. Read-only for lapsed users.
- Sanitize all user content (XSS), safe markdown only.

---

## 11. SECURITY (NON-NEGOTIABLE; NO SYSTEM IS "UNHACKABLE", SO DEFEND IN DEPTH)
- Argon2id for passwords; email verification; TOTP 2FA (mandatory for admin, optional for renters); WhatsApp OTP at signup.
- Admin: mandatory 2FA, optional IP allowlist, separate route, short session, re-auth for sensitive actions.
- Sessions: httpOnly, Secure, SameSite cookies; rotation on privilege change; device list with revoke.
- Input validation (Zod) on every route; parameterized queries (Prisma); CSRF protection; strict CSP and security headers; SSRF protection on any URL fetch; file upload restrictions (none by default).
- RBAC on every API route; automated IDOR tests proving renters cannot read other renters' data or admin endpoints.
- Rate limits and lockouts: auth, OTP, checkout, chat, forum, support, API. Cloudflare Turnstile on signup/login/forgot password.
- Payments: signed webhook verification, idempotency keys, amount and currency checks against server-side price, replay protection.
- Secrets: env-managed or KMS; AES-256-GCM envelope encryption for any sensitive stored field (e.g. WhatsApp numbers at rest); rotate keys with a documented runbook.
- Logging: structured, no secrets, no PII beyond IDs; separate immutable audit log.
- Anomaly alerts: failed-login spikes, many accounts from one IP, repeated OTP requests, window requests from different countries.
- Dependencies: lockfile, automated dependency and secrets scanning in CI, Renovate or Dependabot.
- Backups: daily encrypted DB backups, tested restore, documented in the admin runbook.
- Privacy by design: data minimization, account export/deletion flows, retention jobs (see Privacy Policy).
- Pen-test checklist and a "security proof" test file for each item above.

---

## 12. DESIGN SYSTEM (STEAM-INSPIRED, ORIGINAL BRAND)
**Tokens**
```
--bg-deep:   #171a21   (top nav, footer)
--bg:        #1b2838   (page)
--panel:     #2a475e   (cards, headers)
--panel-2:   #16202d   (inputs, inset areas)
--accent:    #66c0f4   (links, highlights)
--accent-2:  #1a9fff   (hover)
--text:      #c7d5e0   (body)
--text-dim:  #8f98a0   (secondary)
--cta-from:  #75b022   --cta-to: #588a1b   (green "Rent" buttons)
--danger:    #c23c2a   --warn: #e4b222   --ok: #5ba32b
```
Support light-on-dark only; ensure WCAG AA contrast. Font: Inter (or similar free font), tight uppercase nav labels.

**Layout**
- Top global nav: STORE · LIBRARY · COMMUNITY · SUPPORT · Steamer, with slot counter pill and user menu.
- Store: wide hero carousel with game capsule art, "Hot this month", tier rows, and sidebar filters.
- Library/dashboard: left sidebar (My Plan, My Games, Setup Window, Payments, Guidelines), main content area.
- Cards: 460×215 header art ratio, hover lift with subtle glow, price box bottom-right in the Steam style (dark chip with the green rent price, struck/dim Steam price).
- Badges: Hot, New, Offline OK (verified), Mixed, Unverified, launcher (Ubisoft / EA / Rockstar).
- Components: modal checklists with tick animations, circular countdown, tabbed game pages, toast notifications, skeleton loaders.
- Fully responsive, mobile-first; bottom tab bar on mobile (Store, Library, Community, Support).
- Original logo and brand name only. Do not copy Steam's logo, icon set or exact wordmark styling.
- Tone of voice: plain, friendly, honest. Always show "Built on Trust" and the offline-only rule where relevant.

---

## 13. LEGAL PAGES (from `/docs/legal/LEGAL_AND_POLICIES.md`)
Render as versioned pages with version numbers and effective dates: Terms of Service, "Read before you buy" disclosure, Trust Pledge, Plan and Purchase Conditions (including refund/credit rules), Renter Guidelines, Community Rules, Privacy Policy, Cookie notice. Changing any of them bumps the version and forces re-acceptance on next login or purchase. Show the legal links in the footer and in checkout. Admin can edit them only through the versioned content manager.

---

## 14. DATA MODEL (PRISMA)
User, Profile, Device (RenterDevice), Plan, PlanGame, Subscription (status, startDate, endDate, price, type), Payment, Game, Series, PricingTier, SlotReservation, WaitlistEntry, SetupWindow (status, startedAt, expiresAt, userId, closedAt), Grant, Violation (evidence JSON), Strike, ConsentRecord, LegalDocumentVersion, LegalAcceptance, Thread, Post, ChatMessage, Report, Ticket, TicketMessage, Announcement, AdminTask (type, status, subject, dueAt), AuditLog, SteamPresenceSnapshot, PlaytimeSnapshot and PlaytimeDelta (behind the optional audit flag), Coupon, SystemSetting.

Key constraints: partial unique index on open SetupWindow; unique active Subscription per user; slot count transaction-safe; indexes on every filter and foreign key.

---

## 15. PHASES
1. **Foundation:** auth, WhatsApp OTP, roles, admin shell, design system, legal pages with versioning.
2. **Catalog:** CSV import, appid matching review, images, pricing, filters, game pages.
3. **Commerce:** cart, pricing function, slot reservation, waitlist, consent, Razorpay, subscriptions, expiry jobs.
4. **Access:** onboarding wizard, setup windows, admin task cards, grants, presence alerts, renter registry.
5. **Community:** forum, chat, moderation, per-game threads, support tickets.
6. **Hardening:** security tests, IDOR tests, load test, backups, runbooks, pen-test checklist, optional playtime audit.

---

## 16. DELIVERABLES
Architecture diagram, folder structure, Prisma schema and migrations, full backend and frontend, seed scripts, Docker and deployment guide, `.env.example`, security checklist with test proof per item, admin runbook (daily routine, setup-window handling, rotating credentials, handling violations, backups, account-lost playbook), and a short user help center.

---

## 17. LIMITS THAT MUST BE VISIBLE IN THE ADMIN RUNBOOK AND THE LEGAL PAGES
1. Renting access to a Steam account is outside what Valve's terms allow, so the account can be restricted at any time. Run the business as though the account could disappear: keep monthly plans only, keep slots capped, and buy games gradually.
2. Offline play cannot be tracked in real time. Trust plus the registry is the control.
3. Revocation only takes effect when a renter's Steam client next goes online.
4. Single-game plans are not technically locked.
5. Denuvo-style activation limits can block installs if many renters install the same game within a short time. The admin console warns when more than N (default 3) renters are scheduled for the same game within 24 hours.


---

# ADDENDUM 6: MANUAL PAYMENTS AND PERSONAL CONTACT (OVERRIDES EARLIER PAYMENT, OTP AND WHATSAPP-API RULES)

## PRINCIPLE
No payment gateway, no WhatsApp Business API, no Cloud API, no OTP provider, no third-party messaging service. The owner collects payment on his own UPI, and confirms and talks to renters on his own phone, personal WhatsApp and email. The website only records state (who is waiting, who paid, who is active). Everything automatic about money or messaging is removed.

### 1. REMOVE FROM THE BUILD
- Razorpay (or any gateway), payment webhooks, idempotency-key logic and signature verification.
- WhatsApp Business Cloud API, WhatsApp OTP and any SMS/OTP provider.
- Any "send WhatsApp message" automation or unofficial library. The app must never send WhatsApp messages by itself.
- Keep: Cloudflare Turnstile, Argon2id/bcrypt, 2FA for admin, rate limits, audit log, RBAC.

### 2. UPI PAYMENT FLOW (replaces the Razorpay step in the purchase flow)
a) Admin settings: UPI ID (VPA), payee name, an uploadable static UPI QR image (fallback), admin phone number, admin WhatsApp number, admin email, optional WhatsApp group invite link, payment instructions text.
b) At checkout, after the consent and Trust Pledge are recorded and the slot is held, show a payment screen with:
   - the exact amount (from the server-side pricing function) and a unique Order ID (e.g. STR-2026-000123),
   - a dynamically generated UPI QR plus a "Pay with UPI app" button, both from a standard UPI deep link: `upi://pay?pa=<VPA>&pn=<PAYEE>&am=<AMOUNT>&cu=INR&tn=<ORDER ID>`. Generate the QR locally with a QR library, with no external service. If the VPA is not set, show the uploaded static QR instead and the exact amount to enter,
   - a clear instruction: "Put the Order ID in the payment note. After paying, enter your UPI transaction ID (UTR) and tap 'I have paid'."
c) "I have paid" form: UTR / transaction ID (required, 12-digit numeric validation), payer name, optional payment screenshot. Block duplicate UTRs with a unique constraint.
d) Payment statuses: PENDING_PAYMENT -> PAYMENT_SUBMITTED -> VERIFIED -> ACTIVE, or REJECTED / EXPIRED / CANCELLED. Plan status changes only when the admin marks VERIFIED. Never trust the client. Never auto-activate.
e) Admin "Payments" queue: shows pending submissions with Order ID, renter, amount, UTR, time submitted, screenshot (if any). Buttons: Verify, Reject (with reason), Ask for details. Show a warning on every row: "Confirm the money in your own bank/UPI app. Do not rely on the screenshot." Require the admin to tick "I have confirmed this amount in my bank/UPI app" before Verify becomes active.
f) Slot hold timers (admin-configurable): 30 minutes to pay and submit the UTR; once submitted, the slot stays held for up to 3 hours while the admin verifies; if the admin has not acted by then, keep the hold up to 24 hours and show it as "Overdue" on the dashboard. Release the slot automatically on expiry or rejection and notify the next waitlist person.
g) Screenshot handling (the only file upload in the app): images only (jpg, png, webp), 3 MB max, strip EXIF, store privately and encrypted, served only to the admin, auto-delete 30 days after verification (configurable).
h) Renewal uses the same flow. There is no auto-renew and no auto-debit.
i) Refunds are done manually by the admin from his own UPI. The admin marks a Refund record (amount, reason, date, reference). The site never moves money.
j) Payment history for the renter shows Order ID, amount, UTR (masked except last 4), status and date.

### 3. WHATSAPP AND PHONE (PERSONAL, MANUAL)
a) Contact details shown on the site (from admin settings): phone, WhatsApp number, email, optional group invite link. All interaction is personal and manual.
b) Number verification without OTP: at signup the user enters their WhatsApp number and the site shows a short code (e.g. VERIFY 4821) with a "Send on WhatsApp" button that opens `wa.me/<admin number>?text=VERIFY%204821` (a plain link only). The admin sees the pending verification in a queue and marks the number as verified after receiving the message. Rate-limit this flow.
c) Credential relay stays manual: the admin sends login details and Steam Guard codes in his own WhatsApp chat. The site never stores or shows them. Keep the admin task checklist (credentials sent, code sent, renter confirmed offline), which the admin ticks by hand. Store metadata only.
d) Email: no transactional provider is required. Email addresses are collected for the account and for the admin's own use. If system emails (verification, password reset) are wanted, make it OPTIONAL via standard SMTP settings in the admin panel (the owner's own mailbox), and disable features that need email if SMTP is not configured. Email verification can instead be done by the admin marking it verified.
e) Notifications to the admin: dashboard badges and counts for pending payments, pending number verifications, setup-window requests and open tickets, plus optional browser notifications while the dashboard is open. No third-party messaging.
f) Notifications to renters: shown in the site (banners and dashboard). Plan-expiry reminders appear on the dashboard, and the admin gets a "send reminders" list with ready-made WhatsApp text templates (with wa.me links, no secrets) to message them manually.
g) Optional WhatsApp group (admin-configured): shown as an "Join the group (optional)" button on the dashboard. Joining needs a separate checkbox: "I agree to be added to the group; my number will be visible to other members." Without the checkbox the button is disabled. The group is for announcements and help, never for credentials or codes. Recommend announcement-only mode (admin-only posting) in the admin help text.
h) Waitlist notifications, account-lost broadcast, and expiry tasks all become admin task lists with ready-made message templates and one-tap wa.me links. The admin sends the messages by hand from his own number.

### 4. DATA MODEL CHANGES
Remove: gateway fields and webhook tables. Add or modify:
- Order (id, orderId, userId, subscriptionDraft JSON, amount, status, createdAt, expiresAt)
- PaymentSubmission (orderId, utr UNIQUE, payerName, screenshotPath, submittedAt, verifiedBy, verifiedAt, rejectionReason)
- Refund (orderId, amount, reason, reference, paidAt, by admin)
- ContactVerification (userId, channel, code, status, requestedAt, verifiedAt, verifiedBy)
