import puppeteer from "puppeteer";
import path from "path";

const url = "-";
const downloadPath = path.resolve("./data");
const getScreenshotPath = (filename) => {
  return `screenshots/${filename}_${
    new Date().toISOString().replace(/:/g, "-").png
  }`;
};
const currentDate = new Date();
const year = currentDate.getFullYear().toString().slice(-2);
const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
const day = currentDate.getDate().toString().padStart(2, "0");
const fileName = `ZYM${year}${month}${day}v1`;

(async () => {
  const browser = await puppeteer.launch({
    headless: "false",
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(600000);

  const client = await page.target().createCDPSession();
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath,
  });

  // Go to site
  await page.goto(url);

  // Wait for header ready
  const imageSelector =
    'div.cdk-drag.lego-component-repeat.ng-star-inserted img[ng-src^="blob:"]';
  await page.waitForSelector(imageSelector);
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: getScreenshotPath("0_header_ready"),
  });

  // Wait for table ready
  await page.waitForSelector('.header-text .filterable[title="MB"]');
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: getScreenshotPath("1_table_ready"),
  });

  // Right click table
  const containerHandle = await page.$('.header-text .filterable[title="MB"]');
  await containerHandle.click({ button: "right" });
  await page.waitForSelector(
    'button.mat-menu-item[role="menuitem"][tabindex="0"][aria-disabled="false"]'
  );
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: getScreenshotPath("2_export_button_ready"),
  });

  // Wait for the export button to appear in the context menu
  await page.click(
    'button.mat-menu-item[role="menuitem"][tabindex="0"][aria-disabled="false"]'
  );
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: getScreenshotPath("3_export_menu"),
  });

  // Change name of file
  await page.waitForSelector('input[formcontrolname="fileName"]');
  await page.$eval(
    'input[formcontrolname="fileName"]',
    (element) => (element.value = "")
  );
  await page.type('input[formcontrolname="fileName"]', fileName);
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: getScreenshotPath("4_change_filename"),
  });

  // Download file
  await page.waitForSelector('button.mat-raised-button[color="primary"]');
  await page.click('button.mat-raised-button[color="primary"]');
  await new Promise((r) => setTimeout(r, 3000));

  // Upload to S3
  // Code to upload

  await browser.close();
})();
