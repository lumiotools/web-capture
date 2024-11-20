import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import path from "path";
import fs from "fs";

export const handleWebsiteCapture = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      success: false,
      message: "Error: URL parameter is required.",
    });
  }

  const safeFileName = url.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const screenshotPath = path.join("captures", `${safeFileName}.webp`);

  // Check if the screenshot already exists
  if (fs.existsSync(screenshotPath)) {
    const publicUrl = `/captures/${safeFileName}.webp`; // Assuming public folder setup
    return res.status(200).json({
      success: true,
      data: publicUrl,
    });
  }

  puppeteer.use(StealthPlugin());
  const browser = await puppeteer.launch({
    args: ["--disable-http2"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 608 });
    await page.goto(url, { timeout: 60000 });
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Capture screenshot and save it
    await page.screenshot({ path: screenshotPath, type: "webp" });

    await browser.close();

    const publicUrl = `/captures/${safeFileName}.webp`;

    return res.status(200).json({
      success: true,
      data: publicUrl,
    });
  } catch (error) {
    console.log(error);
    await browser.close();

    res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
};
