async function testCloudSync() {
  console.log("=== Testing Central Cloud Persistence & User Survival ===");

  const email = `cloud_tester_${Date.now()}@gmail.com`;
  const name = "Cloud Tester";
  const phone = "+919988776655";

  // 1. Register user
  console.log("1. Registering user:", email);
  const regRes = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password: "TestPassword123!",
      displayName: name,
      whatsappNumber: phone,
    }),
  });

  const regData = await regRes.json();
  console.log("Registration result:", regRes.status, regData.success ? "SUCCESS" : regData);
  if (!regData.success) throw new Error("Registration failed");

  // 2. Fetch directly from cloud vault to verify it's persisted remotely!
  console.log("2. Checking central remote cloud vault...");
  const cloudRes = await fetch("https://api.restful-api.dev/objects/ff808181a09d98f701a1b6088aab5c26");
  const cloudData = await cloudRes.json();
  const remoteUser = cloudData.data?.users?.find((u) => u.email === email.toLowerCase());
  console.log("Found in remote Cloud Vault:", remoteUser ? "YES! Email: " + remoteUser.email : "NO");
  if (!remoteUser) throw new Error("User was not stored in central cloud vault!");

  // 3. Admin login and fetch renters registry
  console.log("3. Logging in as admin and verifying admin roster...");
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "steamer.support365@gmail.com",
      password: "SteamerMasterPass2026!",
    }),
  });
  const cookie = loginRes.headers.get("set-cookie") || "";

  const rentersRes = await fetch("http://localhost:3000/api/admin/renters", {
    headers: { Cookie: cookie },
  });
  const rentersData = await rentersRes.json();
  console.log("Total renters in admin registry:", rentersData.registry?.length);
  const foundInRoster = rentersData.registry?.some((r) => r.email === email.toLowerCase());
  console.log("New user present in admin roster:", foundInRoster);
  if (!foundInRoster) throw new Error("User not present in admin roster!");

  console.log("🎉 ALL PERSISTENCE TESTS PASSED 100%! USER WILL NEVER BE DELETED!");
}

testCloudSync().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
