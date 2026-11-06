# Steamer Admin Runbook & Operations Manual (v1.0)

> **CONFIDENTIAL — FOR STEAMER PLATFORM OPERATOR & DEDICATED VAULT ADMINS ONLY**  
> *Last Updated: November 2026 | Operating under Addendum 6 (Manual Payments & Personal WhatsApp Contact)*

---

## 1. Operating Philosophy & Ground Rules

1. **Vault Account Isolation:** The Steam vault account (`steamer_vault_01`) belongs strictly to the Steamer business. It is NEVER linked to personal email, personal phone numbers, or personal gaming libraries.
2. **Never Automate Credentials or Money:** Under Addendum 6, there is zero third-party gateway automation and zero automated WhatsApp bot messaging. All bank verification is confirmed in the admin's banking app, and all login credentials/Steam Guard codes are relayed manually via personal WhatsApp (`wa.me` links).
3. **Offline Play Integrity:** Only ONE renter may be online at any single time for download/setup. Every renter must switch to Steam Offline Mode before launching games.
4. **Denuvo Awareness:** Titles with Denuvo DRM enforce a hardware activation cap of 5 unique machines per 24 hours. Steamer caps new setups at **3 per day per Denuvo title** to prevent lockouts.

---

## 2. Daily Routine Checklist

### 🌅 Morning Routine (09:00 - 10:00 IST)
1. **System Health Check:**
   - Log in to the Admin Console at `/admin/dashboard`.
   - Verify server uptime, active database connections, and background job queue status.
   - Review the **Active Renters** count against the maximum platform capacity limit (e.g., 20/25 slots).
2. **Bank Account & Payment Queue Check:**
   - Navigate to `/admin/payments`.
   - For every `PAYMENT_SUBMITTED` record, open your bank/UPI app (BHIM, GPay, PhonePe, or Bank Portal).
   - Match the 12-digit UTR and exact ₹ amount.
   - **Crucial:** Never trust screenshots alone. Check the checkbox *"I have confirmed this amount in my bank/UPI app"* before clicking **Verify**.
3. **Pending WhatsApp Number Verifications:**
   - Navigate to `/admin/verifications`.
   - Compare pending verification tokens against your WhatsApp incoming messages (`wa.me/<admin>?text=VERIFY%20<TOKEN>`).
   - Click **Approve Verification** once matched.
4. **Setup Window Queue Review:**
   - Review `/admin/setup-windows` for pending setup requests.
   - Confirm scheduled windows for the day and check for any overlapping Denuvo title requests.

### ☀️ Afternoon Routine (14:00 - 15:00 IST)
1. **Monitor Active Setup Windows:**
   - If a renter is currently in an active 3-hour setup window:
     - Check WhatsApp chat to confirm download progress.
     - Ensure the renter sets Steam to Offline Mode and clicks *"I am now in Offline Mode"* on their portal before their timer expires.
2. **Support Ticket Resolution:**
   - Visit `/support` (or Admin Ticket View) to address download stalls, Steam Guard re-prompt queries, or cloud save questions.
   - Standard resolution SLA: < 2 hours during operating hours.

### 🌙 Evening Routine (21:00 - 22:30 IST)
1. **Subscription Expirations & Slot Reclamation:**
   - Review subscriptions ending within 24 hours.
   - Remind renters via personal WhatsApp 48h and 24h prior to expiry with renewal instructions.
   - Expired subscriptions that did not renew are automatically set to `EXPIRED`, releasing the slot for the waitlist.
2. **Vault Password Hygiene:**
   - If scheduled for weekly rotation, rotate the master Steam password at 23:00 IST when no setup windows are active.
   - Terminate all other web sessions via Steam Account Settings -> *Manage Steam Guard*.

---

## 3. Addendum 6 Payment Verification Protocol

### Step-by-Step Flow:
1. **Renter Checkout:**
   - Renter accepts 12-point disclosure & signs Trust Pledge.
   - System reserves slot for 30 minutes (`PENDING_PAYMENT`).
   - Dynamic UPI QR generated with standard deep link:
     `upi://pay?pa=<VPA>&pn=<PAYEE>&am=<AMOUNT>&cu=INR&tn=<ORDER_ID>`
2. **Renter Submission:**
   - Renter pays via UPI app, inputs 12-digit UTR, and clicks *"I have paid"*.
   - Status changes to `PAYMENT_SUBMITTED`. Slot hold is automatically extended by **3 hours** to give the admin verification time.
3. **Admin Verification:**
   - Admin receives dashboard notification badge.
   - Admin checks physical bank account for matching UTR and amount.
   - Admin checks confirmation checkbox and clicks **Verify**:
     - Status becomes `VERIFIED`.
     - Subscription becomes `ACTIVE` for 30 days.
     - Slot officially occupied.
     - WhatsApp verification prompt displayed for renter onboarding.
4. **Rejection or Expiry:**
   - If UTR is fake or uncredited after 3 hours, click **Reject** with reason (e.g., *"UTR not found in bank statement"*).
   - Slot is released immediately and waitlist notified.

---

## 4. WhatsApp Credential Relay Protocol

> **NEVER store, display, or transmit Steam master credentials via web UI or database.**

When a renter's setup window starts:
1. Navigate to `/admin/setup-windows`.
2. Find the active task card and click **"Open WhatsApp Chat"** (`wa.me/<renter_phone>?text=Hello...`).
3. Send Pre-formatted Message 1:
   > *"Hello [Name], your Steamer setup window is now ACTIVE for the next 3 hours. Please open Steam on your PC. Let me know when you reach the login screen."*
4. Once the renter confirms readiness, send vault username and current temporary password in chat.
5. Watch the physical Steam Authenticator phone for the 5-character Steam Guard prompt.
6. Send Pre-formatted Message 2:
   > *"Your Steam Guard code is: [CODE]. Enter it now. Begin your game downloads immediately."*
7. Monitor progress:
   - Once downloads complete, instruct renter:
     > *"Downloads complete! Go to Steam menu -> Click 'Go Offline...'. Confirm Steam restarts in Offline Mode. Once confirmed, tap 'I am now in Offline Mode' on your Steamer dashboard."*
8. Check off task steps on Admin Console:
   - [x] Credentials sent on WhatsApp
   - [x] Steam Guard code sent
   - [x] Renter confirmed in Offline Mode
9. Click **Complete Window** to make the account available for the next scheduled renter.

---

## 5. Denuvo 24-Hour Installation Management

- **The Limit:** Games protected by Denuvo Anti-Tamper (e.g., *Persona 5 Royal*, *Dead Space*, *Total War: Warhammer III*, *EA Sports FC*) allow maximum **5 unique PC activations per rolling 24 hours**.
- **Steamer Safety Cap:** To prevent locking out legitimate renters, Steamer enforces a maximum of **3 setup windows per 24 hours** across all Denuvo-tagged titles.
- **Admin Action:**
  - If 3 Denuvo setups have occurred within 24 hours, postpone any additional setup requests for Denuvo titles to the next day.
  - Inform renter: *"Denuvo daily hardware activation token limit reached for today. Your 3-hour setup window has been queued for tomorrow at 10:00 AM."*

---

## 6. Three-Strike Enforcement Ladder

Steamer operates on a **Trust-First** model backed by strict escalation:

| Strike Level | Trigger / Cause | Admin Action & Penalty |
| :--- | :--- | :--- |
| **Strike 1: Formal Warning** | Accidental online connection without switching to Offline Mode; sharing non-sensitive account screenshots in public. | 1. Admin logs strike in `/admin/strikes`.<br>2. WhatsApp warning sent.<br>3. Renter must review and acknowledge Offline Mode guidelines. |
| **Strike 2: 48-Hour Freeze** | Second online collision kicking another renter; modifying Steam client settings; attempting cloud sync. | 1. Admin issues Strike 2.<br>2. Subscription frozen for 48 hours.<br>3. Vault password rotated immediately.<br>4. Renter must schedule a mandatory supervised re-setup. |
| **Strike 3: Permanent Ban & Forfeiture** | Tampering with Steam Guard; sharing credentials; third-party tool usage; chargeback fraud; deliberate sabotage. | 1. Immediate account termination & permanent blacklist (phone, email, IP).<br>2. Complete forfeiture of rental fee.<br>3. Instant vault password rotation and deauthorization of all devices. |

---

## 7. Account-Lost Emergency Playbook

**Trigger:** Any unauthorized password reset notification, unexpected Steam Guard removal email, or unauthorized Steam profile change.

### Immediate Action Checklist (Complete within 5 minutes):
1. **Activate Emergency Killswitch:**
   - Go to `/admin/settings` -> Click **"Emergency Onboarding Pause"**.
   - This immediately locks the queue, suspends new checkouts, and cancels upcoming setup windows.
2. **Access Recovery via Valve Support:**
   - Open Steam Client or browser: Navigate to `help.steampowered.com`.
   - Select *"Help, I can't sign in"* -> *"My account was stolen or hijacked"*.
   - Submit proof of original ownership:
     - First CD-Key registered on the account (stored in secure offline safe).
     - Original payment method billing address & first transaction invoice.
     - Associated primary business email address.
3. **Notify Active Renters:**
   - Broadcast WhatsApp announcement to active renters:
     > *"Notice from Steamer Admin: We are performing scheduled security maintenance on the vault account. If your game is already in Offline Mode, continue playing offline without interruption. DO NOT switch Steam to Online Mode until further notice."*
4. **Post-Recovery Hardening:**
   - Reset vault email password with 32-char high-entropy string.
   - Change Steam password.
   - Regenerate Steam Guard Mobile Authenticator backup recovery codes (`R-code`).
   - De-authorize all existing devices in Steam settings.
   - Unpause onboarding and reschedule affected setup windows with complimentary +3 days extension.

---

## 8. Data Protection & DPDP Act Compliance

- All phone numbers stored in the database are encrypted using **AES-256-GCM** envelope encryption (`iv:authTag:ciphertext`).
- Masked phone numbers (`+9198****210`) are shown by default.
- Renters can download their full personal data archive in JSON format anytime from `/profile`.
- Payment screenshot uploads are automatically purged after 30 days.
- User deletion requests must be honored within 72 hours via the Admin Console.

