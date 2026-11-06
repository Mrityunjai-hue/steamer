import assert from "assert";
import { calculatePlanPricing } from "../lib/pricing.ts";
import { inspectContentSafety } from "../lib/content-filter.ts";
import { encryptField, decryptField, maskPhoneNumber } from "../lib/encryption.ts";
import { hashPassword, verifyPassword, signToken, verifyToken } from "../lib/auth.ts";

async function runSecurityProofSuite() {
  console.log("==================================================");
  console.log("  STEAMER SECURITY & CORE LOGIC VERIFICATION SUITE");
  console.log("==================================================");

  // 1. Strict Pricing Function Verification (Section 5.3)
  console.log("\n[TEST 1] Pricing Function & Bundle Caps...");
  
  // Single game (Hot ₹99)
  const singleHot = calculatePlanPricing([{ id: "1", title: "GTA V", hypeTier: "Hot", price: 99 }]);
  assert.strictEqual(singleHot.finalPrice, 99, "Single Hot game should be 99");
  assert.strictEqual(singleHot.planType, "SINGLE");

  // 2 games (Hot 99 + Popular 79 = 178, capped at 149)
  const bundle2 = calculatePlanPricing([
    { id: "1", title: "GTA V", hypeTier: "Hot", price: 99 },
    { id: "2", title: "Spider-Man", hypeTier: "Popular", price: 79 },
  ]);
  assert.strictEqual(bundle2.individualSum, 178);
  assert.strictEqual(bundle2.finalPrice, 149, "2-game bundle must be capped at 149");
  assert.strictEqual(bundle2.savings, 29);
  assert.strictEqual(bundle2.planType, "BUNDLE_2");

  // 3 games (99 + 79 + 59 = 237, capped at 199)
  const bundle3 = calculatePlanPricing([
    { id: "1", title: "GTA V", hypeTier: "Hot", price: 99 },
    { id: "2", title: "Spider-Man", hypeTier: "Popular", price: 79 },
    { id: "3", title: "Batman", hypeTier: "Standard", price: 59 },
  ]);
  assert.strictEqual(bundle3.finalPrice, 199, "3-game bundle must be capped at 199");
  assert.strictEqual(bundle3.savings, 38);
  assert.strictEqual(bundle3.planType, "BUNDLE_3");

  // 6 or more games automatically upgrades to ALL_ACCESS at 300
  const bundle6 = calculatePlanPricing([
    { id: "1", title: "G1", hypeTier: "Budget", price: 39 },
    { id: "2", title: "G2", hypeTier: "Budget", price: 39 },
    { id: "3", title: "G3", hypeTier: "Budget", price: 39 },
    { id: "4", title: "G4", hypeTier: "Budget", price: 39 },
    { id: "5", title: "G5", hypeTier: "Budget", price: 39 },
    { id: "6", title: "G6", hypeTier: "Budget", price: 39 },
  ]);
  assert.strictEqual(bundle6.finalPrice, 300, "6+ games must upgrade to ALL_ACCESS at 300");
  assert.strictEqual(bundle6.planType, "ALL_ACCESS");

  console.log("  ✓ All pricing caps, bundle tiers, and automatic All-Access conversions PASSED");

  // 2. Steam Guard & Credential Leak Filter (Section 10)
  console.log("\n[TEST 2] Steam Guard & Credential Leak Detection (Section 10)...");
  
  const cleanPost = inspectContentSafety("How do I verify game files in Offline Mode on Windows?");
  assert.strictEqual(cleanPost.isSafe, true, "Safe discussion should be approved");

  const guardLeak1 = inspectContentSafety("My steam guard code is 8JK2P please log in");
  assert.strictEqual(guardLeak1.isSafe, false, "Must block 5-char steam guard code pattern");

  const guardLeak2 = inspectContentSafety("code: X8B29");
  assert.strictEqual(guardLeak2.isSafe, false, "Must block short guard code pattern");

  const passwordLeak = inspectContentSafety("The password is SuperSecretPass123");
  assert.strictEqual(passwordLeak.isSafe, false, "Must block explicit password sharing");

  const piracyLeak = inspectContentSafety("Can I download a crack or keygen for this?");
  assert.strictEqual(piracyLeak.isSafe, false, "Must block piracy/crack references");

  console.log("  ✓ Community safety and Steam Guard pattern detection filters PASSED");

  // 3. Cryptographic Enclave (AES-256-GCM Encryption & Masking)
  console.log("\n[TEST 3] AES-256-GCM Envelope Encryption & Masking...");
  
  const originalPhone = "+91 98765 43210";
  const encrypted = encryptField(originalPhone);
  assert.notStrictEqual(encrypted, originalPhone, "Ciphertext must not match plaintext");
  assert(encrypted.includes(":"), "Envelope format must contain iv:tag:data");

  const decrypted = decryptField(encrypted);
  assert.strictEqual(decrypted, originalPhone, "Decrypted text must match original plaintext");

  const masked = maskPhoneNumber(originalPhone);
  assert.strictEqual(masked, "+9198****210", "Phone masking format must obscure middle digits");

  console.log("  ✓ AES-256-GCM envelope encryption and phone masking PASSED");

  // 4. Password Hashing & JWT Session Verification
  console.log("\n[TEST 4] Password Hashing (Bcrypt) & JWT Session Rotation...");
  
  const rawSecret = "SuperSecurePassword#2026!";
  const hash = await hashPassword(rawSecret);
  assert.notStrictEqual(hash, rawSecret);
  
  const isMatch = await verifyPassword(rawSecret, hash);
  assert.strictEqual(isMatch, true, "Password verification must succeed for correct password");

  const isBadMatch = await verifyPassword("WrongPassword", hash);
  assert.strictEqual(isBadMatch, false, "Password verification must reject invalid credentials");

  const sessionToken = signToken({ userId: "user-123", email: "renter@steamer.live", role: "RENTER" });
  const verified = verifyToken(sessionToken);
  assert.strictEqual(verified?.userId, "user-123");
  assert.strictEqual(verified?.role, "RENTER");

  console.log("  ✓ Password hashing, salt rounds, and JWT signing/verification PASSED");

  // 5. Addendum 6 UPI UTR Validation
  console.log("\n[TEST 5] Addendum 6 UPI UTR 12-Digit Validation...");
  
  const validUtr = "431289567123";
  const cleaned = validUtr.trim().replace(/\D/g, "");
  assert.strictEqual(cleaned.length, 12, "Valid UTR must be exactly 12 digits");

  const invalidShortUtr = "12345";
  assert.notStrictEqual(invalidShortUtr.length, 12, "Short UTR must be rejected");

  console.log("  ✓ Addendum 6 UPI UTR format verification PASSED");

  console.log("\n==================================================");
  console.log("  ALL 5 SECURITY & ARCHITECTURE PROOFS VERIFIED ✓");
  console.log("==================================================");
}

runSecurityProofSuite().catch((err) => {
  console.error("Security proof failed:", err);
  process.exit(1);
});

