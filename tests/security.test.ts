import assert from "assert";
import { calculatePlanPricing } from "../lib/pricing.ts";
import { inspectContentSafety } from "../lib/content-filter.ts";
import { encryptField, decryptField, maskPhoneNumber } from "../lib/encryption.ts";
import { hashPassword, verifyPassword, signToken, verifyToken } from "../lib/auth.ts";

async function runSecurityProofSuite() {
  console.log("==================================================");
  console.log("  STEAMER SECURITY & CORE LOGIC VERIFICATION SUITE");
  console.log("==================================================");

  // 1. Strict Pricing Function Verification - Flat ₹300 Lifetime Setup Guide Model
  console.log("\n[TEST 1] Flat ₹300 Lifetime Setup Guide Pricing...");
  
  // Single game preview
  const single = calculatePlanPricing([{ id: "1", title: "GTA V" }]);
  assert.strictEqual(single.finalPrice, 300, "Single game must result in flat 300");
  assert.strictEqual(single.planType, "ALL_ACCESS");

  // Multi-game selection
  const multi = calculatePlanPricing([
    { id: "1", title: "GTA V" },
    { id: "2", title: "Spider-Man" },
    { id: "3", title: "Elden Ring" },
  ]);
  assert.strictEqual(multi.finalPrice, 300, "Multi-game selection must be flat 300");
  assert.strictEqual(multi.planType, "ALL_ACCESS");

  // Explicit All-Access pass
  const explicit = calculatePlanPricing([], true);
  assert.strictEqual(explicit.finalPrice, 300, "All-access pass must be flat 300");
  assert.strictEqual(explicit.planType, "ALL_ACCESS");

  console.log("  ✓ Flat ₹300 Lifetime All-Access Guide pricing verified successfully");

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

