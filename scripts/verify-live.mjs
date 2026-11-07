async function verifyLive() {
  const contactRes = await fetch("https://steamer-one.vercel.app/api/contact");
  const contact = await contactRes.json();
  console.log("Live Contact Phone:", contact.phone);
  console.log("Live Contact WhatsApp:", contact.whatsapp);
  console.log("Live Contact URL:", contact.whatsappUrl);

  const homeRes = await fetch("https://steamer-one.vercel.app");
  const homeHtml = await homeRes.text();
  console.log("Includes 'GET 265 GAMES OF YOUR CHOICE FOR ₹300':", homeHtml.includes("GET 265 GAMES OF YOUR CHOICE FOR ₹300"));
  console.log("Live Support hidden on mobile class present:", homeHtml.includes("hidden md:flex"));
  console.log("Reviews section live:", homeHtml.includes("Community Trust"));
}
verifyLive().catch(console.error);

