import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import path from "path";
import fs from "fs";

puppeteer.use(StealthPlugin());

const formatUrl = (url) => {
  // Remove protocol (http:// or https://)
  let formattedUrl = url.replace(/^https?:\/\//, "");

  // Remove www.
  formattedUrl = formattedUrl.replace(/^www\./, "");

  // Remove everything after the first slash
  formattedUrl =
    formattedUrl.slice(-1) === "/" ? formattedUrl.slice(0, -1) : formattedUrl;

  return formattedUrl;
};

// Ensure the screenshots folder exists
const screenshotsDir = path.join(process.cwd(), "screenshots");
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

const carrierUrls = JSON.parse(
  fs.readFileSync("data/extended_scraped_data.json", "utf-8")
).map(({ url }) => ({
  filename: formatUrl(url).replaceAll("/", "_"),
  url: url,
}));

const auditCompanyUrls = JSON.parse(
  fs.readFileSync("data/audit_companies_data.json", "utf-8")
).map(({ url }) => ({
  filename: formatUrl(url).replaceAll("/", "_"),
  url: url,
}));

const rateShippingEngineUrls = JSON.parse(
  fs.readFileSync("data/rate_shipping_engines_data.json", "utf-8")
).map(({ url }) => ({
  filename: formatUrl(url).replaceAll("/", "_"),
  url: url,
}));

const allUrls = [
  ...carrierUrls,
  ...auditCompanyUrls,
  ...rateShippingEngineUrls,
]

const uniqueUrls = Array.from(new Map(allUrls.map(item => [item.url, item])).values())


const captureScreenshots = async (urls) => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--disable-http2"],
  });

  let i = 0;

  for (const { filename, url } of urls) {
    i++;
    const filePath = path.join(screenshotsDir, `${filename}.webp`);

    // Skip if the screenshot already exists
    if (fs.existsSync(filePath)) {
      console.log(
        `${i}/${urls.length} Screenshot for ${filename} already exists. Skipping.`
      );
      continue;
    }

    console.log(`${i}/${urls.length} Capturing screenshot for: ${url}`);

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 608 });
      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await page.screenshot({ path: filePath, type: "webp" });
      console.log(`Saved screenshot for ${url} as ${filename}.webp`);
      await page.close();
    } catch (error) {
      console.error(`Error capturing screenshot for ${url}:`, error.message);
    }
  }

  await browser.close();
  console.log("All screenshots captured.");
};

console.log(`Total urls: ${uniqueUrls.length}`);

captureScreenshots(uniqueUrls).catch((error) => {
  console.error("Error in script execution:", error.message);
});
