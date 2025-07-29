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

builder.defineStreamHandler(async ({ id }) => {
  const title = await getTitleFromId(id);
  const streams = await scrapeAnimeUnity(title);

  return Promise.resolve({ streams });
});

async function getTitleFromId(id) {
  return "One Piece"; // esempio statico
}

async function scrapeAnimeUnity(title) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.goto("https://www.animeunity.tv/");
  await page.type("input[name='search']", title);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(3000);

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

const app = express();
app.get("/", (req, res) => res.send(builder.getInterface()));
app.listen(7000, () => console.log("Addon in esecuzione sulla porta 7000"));