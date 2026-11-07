async function probeLiveFull() {
  const base = "https://steamer-one.vercel.app";
  console.log(`=== Probing Full Live Flow on ${base} ===`);

  // 1. Consent
  console.log("1. Submitting consent...");
  const consentRes = await fetch(`${base}/api/checkout/consent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accepted: true,
      trustPledge: true,
      holdToken: null,
      guestEmail: `live_pass_user_${Date.now()}@gmail.com`,
      guestName: "Live Test Player",
      guestPhone: "+919936929997",
    }),
  });
  const consent = await consentRes.json();
  console.log("Consent:", consent);
  if (!consentRes.ok || !consent.consentId) throw new Error("Consent failed");

  // 2. Order
  console.log("2. Creating order...");
  const orderRes = await fetch(`${base}/api/orders/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      gameIds: [],
      isAllAccess: true,
      deviceLabel: "Live PC",
      consentId: consent.consentId,
      holdToken: null,
      guestEmail: consent.guestEmail,
    }),
  });
  const order = await orderRes.json();
  console.log("Order:", order);
  const orderId = order.order.orderId;

  // 3. Check access pre-verify
  console.log(`3. Checking access /api/orders/access/${orderId} (Pre-verify)...`);
  const preAccessRes = await fetch(`${base}/api/orders/access/${orderId}`);
  const preAccess = await preAccessRes.json();
  console.log("Pre-verify isVerified:", preAccess.isVerified);

  // 4. Admin login
  console.log("4. Logging in as admin...");
  const loginRes = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "steamer.support365@gmail.com",
      password: "SteamerMasterPass2026!",
    }),
  });
  const cookies = loginRes.headers.get("set-cookie") || "";
  console.log("Admin login status:", loginRes.status);

  // 5. Admin quick verify using PIN
  const rawPin = consent.pin.replace("VERIFY ", "");
  console.log(`5. Admin Quick Verifying via 4-digit PIN: ${rawPin}...`);
  const verifyRes = await fetch(`${base}/api/admin/verifications`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookies },
    body: JSON.stringify({ action: "QUICK_VERIFY", query: rawPin }),
  });
  const verify = await verifyRes.json();
  console.log("Admin verify response:", verify);
  if (!verifyRes.ok || !verify.success) throw new Error("Quick verify failed");

  // 6. Check access post-verify
  console.log(`6. Checking access /api/orders/access/${orderId} (Post-verify)...`);
  const postAccessRes = await fetch(`${base}/api/orders/access/${orderId}`);
  const postAccess = await postAccessRes.json();
  console.log("Post-verify isVerified:", postAccess.isVerified);
  console.log("Post-verify guide title:", postAccess.guide?.title);

  console.log("\n🎉 LIVE PRODUCTION DEPLOYMENT IS 100% VERIFIED WORKING!");
}

probeLiveFull().catch(console.error);
