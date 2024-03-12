"use strict";

const puppeteer = require("puppeteer");
const fs = require("fs");
const sharp = require("sharp");

const logToFile = (message) => {
  const filePath = "log.txt";

  const logContent = `${message}\n`;

  fs.appendFile(filePath, logContent, (err) => {
    if (err) {
      console.error("Không thể ghi log vào file:", err);
    } else {
      // console.log("Đã ghi log vào file thành công.");
    }
  });
};

const roundedImage = async (inputImagePath, outputImagePath) => {
  sharp(inputImagePath)
    .resize(310, 410, {
      fit: "fill",
      position: "center",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .composite([
      {
        input: Buffer.from(
          `<svg><rect x="0" y="0" width="${310}" height="${410}" rx="${20}" ry="${20}"/></svg>`
        ),
        blend: "dest-in",
      },
    ])
    .toFile(outputImagePath, (err, info) => {
      if (err) {
        console.error(err);
      }
    });
};

const crawImage = async (pageMarket) => {
  console.log(pageMarket);
  logToFile(`Page: ${pageMarket}`);
  const browser = await puppeteer.launch({
    executablePath: "/opt/google/chrome/google-chrome",
    headless: "shell",
  });
  const page = await browser.newPage();

  await page.goto(`http://localhost:3000/market-place?page=${pageMarket}`);

  await page.setViewport({ width: 1800, height: 2000 });

  await page.waitForSelector(".market-card-hero-common");

  const divs = await page.$$(".market-card-hero-common .bg-common");

  await new Promise((resolve) => setTimeout(resolve, 8000));

  for (let i = 0; i < divs.length; i++) {
    const div = await divs[i].waitForSelector(".box-id");
    const fullTitle = await div?.evaluate((el) => el.textContent);
    await divs[i].screenshot({
      path: `./img/nft_${fullTitle.replace("#", "")}.png`,
    });
    await roundedImage(
      `./img/nft_${fullTitle.replace("#", "")}.png`,
      `./img-result/nft_${fullTitle.replace("#", "")}.png`
    );
    logToFile(`nft: ${fullTitle.replace("#", "")}`);
  }
  await browser.close();
};

(async () => {
  for (let i = 101; i <= 200; i++) {
    await crawImage(i);
  }
})();
