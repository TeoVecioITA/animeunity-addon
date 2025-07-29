const { addonBuilder } = require("stremio-addon-sdk");
const express = require("express");
const puppeteer = require("puppeteer");

const manifest = {
  id: "org.matteo.animeunity",
  version: "1.0.0",
  name: "AnimeUnity Scraper",
  description: "Addon per vedere anime da AnimeUnity",
  types: ["series"],
  catalogs: [],
  resources: ["stream"],
  idPrefixes: ["tt", "kitsu:"]
};

const builder = new addonBuilder(manifest);

// 🔁 Stream handler
builder.defineStreamHandler(async ({ id }) => {
  const title = await getTitleFromId(id);
  const streams = await scrapeAnimeUnity(title);

  return Promise.resolve({ streams });
});

// 🔍 Funzione per ottenere il titolo (statico per test)
async function getTitleFromId(id) {
  return "One Piece"; // puoi collegarlo a TMDB o Kitsu in futuro
}

// 🕷️ Scraping AnimeUnity
async function scrapeAnimeUnity(title) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.goto("https://www.animeunity.tv/");
  await page.type("input[name='search']", title);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(3000);

  // Qui potresti estrarre i link reali con page.evaluate()

  await browser.close();

  return [
    {
      title: "Original",
      url: "https://animeunity.tv/stream-original",
      quality: "1080p"
    },
    {
      title: "Italian",
      url: "https://animeunity.tv/stream-ita",
      quality: "1080p"
    }
  ];
}

// 🌐 Express server
const app = express();
const PORT = process.env.PORT || 7000;
const addonInterface = builder.getInterface();

// 🔁 Serve il manifest
app.get("/manifest.json", (req, res) => {
  res.send(addonInterface.manifest);
});

// 🔁 Serve le risorse
app.get("/:resource/:type/:id/:extra?.json", (req, res) => {
  addonInterface(req, res);
});

// 🔁 Redirect dalla root
app.get("/", (req, res) => {
  res.redirect("/manifest.json");
});

app.listen(PORT, () => {
  console.log(`✅ Addon AnimeUnity attivo su porta ${PORT}`);
});
