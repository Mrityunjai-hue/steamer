async function runPinTest() {
  console.log("=== Testing PIN Verification Specifically ===");

  // 1. Create a new guest checkout
  const consentRes = await fetch("http://localhost:3000/api/checkout/consent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accepted: true,
      trustPledge: true,
      holdToken: null,
      guestEmail: `pin_tester_${Date.now()}@gmail.com`,
      guestName: "Pin Tester",
      guestPhone: "+919933221100",
    }),
  });

  const consentData = await consentRes.json();
  console.log("Generated PIN:", consentData.pin);
  const rawPinNumber = consentData.pin.replace("VERIFY ", "");

  const orderRes = await fetch("http://localhost:3000/api/orders/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      gameIds: [],
      isAllAccess: true,
      deviceLabel: "Pin Gaming PC",
      consentId: consentData.consentId,
      holdToken: null,
      guestEmail: consentData.email,
    }),
  });
  const orderData = await orderRes.json();
  const orderId = orderData.order.orderId;
  console.log("Created Order:", orderId);

  // Admin login
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "steamer.support365@gmail.com",
      password: "SteamerMasterPass2026!",
    }),
  });
  const cookies = loginRes.headers.get("set-cookie") || "";

  // Admin quick verifies using JUST the 4-digit PIN: rawPinNumber
  console.log(`Verifying using 4-digit PIN: "${rawPinNumber}"...`);
  const verifyRes = await fetch("http://localhost:3000/api/admin/verifications", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookies },
    body: JSON.stringify({ action: "QUICK_VERIFY", query: rawPinNumber }),
  });

  const verifyData = await verifyRes.json();
  console.log("Verify response:", verifyData);
  if (!verifyRes.ok || !verifyData.success) {
    throw new Error(`PIN verification failed: ${JSON.stringify(verifyData)}`);
  }

  // Check access unlocked
  const accessRes = await fetch(`http://localhost:3000/api/orders/access/${orderId}`);
  const accessData = await accessRes.json();
  console.log("Access isVerified:", accessData.isVerified);
  if (accessData.isVerified !== true) {
    throw new Error("Order was not unlocked by PIN verification!");
  }

  console.log("🎉 PIN VERIFICATION TEST PASSED 100%!");
}

runPinTest().catch((e) => {
  console.error("PIN test failed:", e);
  process.exit(1);
});

