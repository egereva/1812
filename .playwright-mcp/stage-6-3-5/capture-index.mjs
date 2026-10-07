import {chromium} from 'file:///C:/Users/infospice/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs'
const browser=await chromium.launch({executablePath:'C:/Users/infospice/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe'})
for(const [locale,width] of [['ru',1440],['en',390]]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'})
  await page.goto(`http://localhost:3020/${locale==='en'?'en/':''}map`,{waitUntil:'domcontentloaded'});await page.locator('.map-marker').first().waitFor({timeout:25000});await page.waitForTimeout(3500)
  await page.locator('.map-page__index summary').click();await page.locator('.map-page__legend summary').click();await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0)})
  await page.screenshot({fullPage:true,path:`.playwright-mcp/stage-6-3-5/${locale}-${width}-final-index-legend.png`});await page.close()
}
await browser.close()
