// Node v24 has native fetch

async function runTest() {
  console.log("=== Testing Checkout Consent & Admin Verification Flow ===");

  // 1. Test Consent
  const consentBody = {
    accepted: true,
    trustPledge: true,
    holdToken: null,
    guestEmail: `tester_${Date.now()}@gmail.com`,
    guestName: "Auto Test Gamer",
    guestPhone: "+919988776655",
  };

  console.log("1. Calling POST /api/checkout/consent...");
  const consentRes = await fetch("http://localhost:3000/api/checkout/consent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(consentBody),
  });

  const consentData = await consentRes.json();
  console.log("Consent response status:", consentRes.status);
  console.log("Consent response data:", consentData);

  if (!consentRes.ok || !consentData.consentId) {
    throw new Error(`Consent failed: ${JSON.stringify(consentData)}`);
  }

  // 2. Test Order Creation
  console.log("\n2. Calling POST /api/orders/create...");
  const orderRes = await fetch("http://localhost:3000/api/orders/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      gameIds: [],
      isAllAccess: true,
      deviceLabel: "Testing Rig",
      consentId: consentData.consentId,
      holdToken: null,
      guestEmail: consentBody.guestEmail,
      guestName: consentBody.guestName,
      guestPhone: consentBody.guestPhone,
    }),
  });

  const orderData = await orderRes.json();
  console.log("Order response status:", orderRes.status);
  console.log("Order data:", orderData);

  if (!orderRes.ok || !orderData.order?.orderId) {
    throw new Error(`Order creation failed: ${JSON.stringify(orderData)}`);
  }

  const orderId = orderData.order.orderId;

  // 3. Check Access endpoint before verification
  console.log(`\n3. Checking GET /api/orders/access/${orderId} (Pre-verification)...`);
  const preAccessRes = await fetch(`http://localhost:3000/api/orders/access/${orderId}`);
  const preAccessData = await preAccessRes.json();
  console.log("Pre-access isVerified:", preAccessData.isVerified);
  if (preAccessData.isVerified !== false) {
    throw new Error("Expected isVerified to be false initially");
  }

  // 4. Admin Quick Verify using Login Session or PIN
  console.log("\n4. Logging in as admin to test Quick Verify...");
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "steamer.support365@gmail.com",
      password: "SteamerMasterPass2026!",
    }),
  });

  const cookies = loginRes.headers.get("set-cookie") || "";
  console.log("Admin login status:", loginRes.status);

  // Quick verify using the orderId
  console.log(`\n5. Calling POST /api/admin/verifications with query: ${orderId}...`);
  const verifyRes = await fetch("http://localhost:3000/api/admin/verifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookies,
    },
    body: JSON.stringify({
      action: "QUICK_VERIFY",
      query: orderId,
    }),
  });

  const verifyData = await verifyRes.json();
  console.log("Admin verify response status:", verifyRes.status);
  console.log("Admin verify response:", verifyData);

  if (!verifyRes.ok || !verifyData.success) {
    throw new Error(`Quick verify failed: ${JSON.stringify(verifyData)}`);
  }

  // 6. Check Access endpoint after verification
  console.log(`\n6. Checking GET /api/orders/access/${orderId} (Post-verification)...`);
  const postAccessRes = await fetch(`http://localhost:3000/api/orders/access/${orderId}`);
  const postAccessData = await postAccessRes.json();
  console.log("Post-access isVerified:", postAccessData.isVerified);
  console.log("Post-access guide available:", !!postAccessData.guide?.steps?.length);

  if (postAccessData.isVerified !== true) {
    throw new Error("Expected isVerified to be TRUE after admin verification!");
  }

  console.log("\n🎉 ALL TESTS PASSED! End-to-end verification and single-checkbox checkout verified successfully!");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
