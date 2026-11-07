async function check() {
  const r = await fetch("https://store.steampowered.com/api/appdetails?appids=2947440");
  const d = await r.json();
  console.log("Silent Hill f header_image:", d["2947440"].data.header_image);
  console.log("Capsule image:", d["2947440"].data.capsule_image);
  console.log("Screenshots:", d["2947440"].data.screenshots?.[0]?.path_full);
}
check();
