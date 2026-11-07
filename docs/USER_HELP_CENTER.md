# Steamer Renter Knowledge Base & Help Center (v1.0)

Welcome to the **Steamer** User Guide! This document provides complete instructions on how your rental works, how to schedule setup windows, how to configure Steam Offline Mode properly, and how to back up your game saves locally.

---

## 1. What is Steamer?

**Steamer** is a premier PC game access platform built for passionate gamers in India. Instead of paying ₹3,000 to ₹5,000 to buy games you might only play once, Steamer allows you to rent time-limited access to games on a dedicated, high-speed vault library starting at just ₹49/month or ₹300/month for All-Access.

### Core Operating Principles:
1. **Built on Trust:** We do not install intrusive software or DRM wrappers on your PC. You use the official Steam client.
2. **Offline Mode Only:** You play strictly in Steam Offline Mode. Online multiplayer is not supported.
3. **Dedicated Setup Windows:** Game downloads, updates, and initial Steam Guard authentications take place inside an exclusive 3-hour scheduled window.
4. **Zero Shared Secrets:** We never store or show passwords on the web. The vault admin relays your one-time setup code directly to your verified WhatsApp.

---

## 2. The 4-Step Getting Started Guide

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   1. SELECT &   │ ──> │   2. VERIFY ON   │ ──> │   3. SCHEDULE    │ ──> │   4. GO OFFLINE  │
│   PAY VIA UPI   │     │     WHATSAPP     │     │   SETUP WINDOW   │     │    & PLAY NOW    │
└─────────────────┘     └──────────────────┘     └──────────────────┘     └──────────────────┘
```

### Step 1: Select Your Games & Pay
- Add single games, custom bundles, or All-Access to your cart.
- Review and accept the 12-point disclosure and sign the digital Trust Pledge.
- Complete payment using your preferred UPI app (GPay, PhonePe, Paytm, BHIM) by scanning the dynamic QR or paying to the registered VPA.
- Enter your **12-digit UTR / Transaction ID** on the checkout screen and click *"I have paid"*.

### Step 2: Verify WhatsApp
- Click the *"Verify on WhatsApp"* button on your dashboard.
- This opens a direct chat with the Steamer Vault Admin (`wa.me/<admin>?text=VERIFY%20<CODE>`).
- Send the pre-filled code. Once the admin approves your number, your account is unlocked.

### Step 3: Request Your 3-Hour Setup Window
- On your Steamer dashboard, navigate to **Setup Window** and click *"Request Window"*.
- When your turn arrives, your 3-hour timer starts.
- The admin will message you on WhatsApp with the vault login and your one-time Steam Guard code.
- Log into Steam, download your selected games, and launch each game ONCE to generate initial shaders and files.

### Step 4: Switch to Offline Mode & Release Window
- Once your games are installed, switch Steam to Offline Mode (instructions below).
- Return to your Steamer dashboard and click **"I am now in Offline Mode"**.
- Your setup window is released for the next renter, and you enjoy uninterrupted offline gaming for your full 30-day rental period!

---

## 3. How to Switch Steam to Offline Mode (Step-by-Step)

> **IMPORTANT:** You MUST switch to Offline Mode before launching your games for regular play. Leaving Steam online kicks other renters and will result in a strike against your account.

1. **Complete All Downloads:** Verify in the Steam Downloads tab that all your rented titles show as *100% - Ready to Play*.
2. **First-Time Boot:** Launch each game once to the main title screen to ensure all initial DirectX, Visual C++, and DRM licenses are cached. Then exit the game.
3. **Switch to Offline Mode:**
   - In the top-left menu bar of Steam, click **Steam**.
   - Click **"Go Offline..."** from the dropdown menu.
   - A dialog box will appear saying: *"Steam will restart in Offline Mode. You will not be able to access the Steam Community or play online games."*
   - Click **"Restart in Offline Mode"**.
4. **Confirm Offline Status:**
   - Steam will restart.
   - In the bottom-right corner of the Steam client window, verify the indicator displays: **"OFFLINE MODE"**.
5. **Confirm on Steamer Dashboard:**
   - Return to your browser window at `https://steamer.live/setup-window`.
   - Complete the 3 checklist items and click **"I am now in Offline Mode"**.

---

## 4. Local Save File Management & Cloud Cautions

### Why Cloud Sync is Disabled
Because multiple renters access the vault games in Offline Mode across separate PCs, **Steam Cloud Sync is strictly disabled**. Enabling Cloud Sync can overwrite your progress with another player's save files or reset your campaign progress.

### How to Back Up Your Saves Manually
Your save games are stored locally on your own Windows PC. Even if your 30-day rental expires, your save files remain safe on your computer!

Common Windows save paths:
- `%USERPROFILE%\Saved Games\<Game Name>`
- `%LOCALAPPDATA%\<Publisher>\<Game Name>\Saved\`
- `%APPDATA%\<Game Name>\`
- `C:\Users\<YourUsername>\Documents\<Game Name>\`

> **Pro Tip:** Before uninstalling any game or reformatting your PC, copy your game's save folder to your personal Google Drive or USB drive. If you renew your rental later, your save progress will automatically resume!

---

## 5. Third-Party Launchers & DRM Notes

Some games in the catalog require secondary launcher accounts:

| Launcher Type | Example Games | What You Need to Know |
| :--- | :--- | :--- |
| **Native Steam** | *Cyberpunk 2077, Elden Ring, Black Myth: Wukong* | Seamless. Pure Steam Offline Mode without third-party accounts. |
| **EA App** | *FIFA / EA Sports FC, Dead Space, Star Wars Jedi* | Requires EA App installed. Set both Steam AND EA App to Offline Mode. |
| **Ubisoft Connect** | *Assassin's Creed, Far Cry* | Requires Ubisoft Connect installed. Must be switched to Offline Mode in client settings. |
| **Rockstar Games** | *Grand Theft Auto V, Red Dead Redemption 2* | Launches via Rockstar Games Launcher. Requires story mode offline profile. |
| **Denuvo Anti-Tamper** | *Persona 3 Reload, Total War: Warhammer III* | Denuvo requires an online token refresh once every 30 days. Handled during your initial setup window. |

---

## 6. Troubleshooting & Common Questions

### Q: Steam shows "Steam is currently in Offline Mode". Is this correct?
**A:** Yes! That is exactly what you want. You can launch and play all downloaded single-player campaigns directly from your Steam Library in this state.

### Q: What if a game receives an update during my 30-day rental?
**A:** Single-player games can be played without updating while in Offline Mode. If a critical patch is released that you want, navigate to `/setup-window` and request a brief 1-hour **Update Window**. The admin will coordinate an online slot for your update.

### Q: Can I renew my subscription after 30 days?
**A:** Yes! 48 hours before your plan expires, a "Renew Plan" button will appear on your dashboard. Simply submit your payment and UTR. Your games stay installed on your PC without needing to re-download.

### Q: What happens if my setup window expires before my download finishes?
**A:** If you are downloading a huge 100 GB+ game on a slower internet connection, message the admin on WhatsApp **before** your 3 hours are up. The admin can grant an extension on the console if no other renter is immediately waiting.

### Q: What if a game launch fails or a manifest does not register?
**A:** Refer this link in case of failures: [https://lua.tools/fixes](https://lua.tools/fixes)

---

## 7. Steamer Community Rules & Trust Pledge Summary

- **Never Share Vault Passwords:** Sharing credentials with friends or in forums is an instant permanent ban.
- **Stay in Offline Mode:** Never switch back to Online Mode unless inside an approved setup window.
- **Be Helpful:** Share performance tips and optimization guides in our Community Hub at `/community`.
- **Need Help?** Open a ticket at `/support` or reach out to the admin on WhatsApp.

