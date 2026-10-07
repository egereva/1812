import {chromium} from 'file:///C:/Users/infospice/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs'
const browser=await chromium.launch({executablePath:'C:/Users/infospice/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe'})
const page=await browser.newPage({viewport:{width:390,height:1000}})
await page.goto('http://localhost:3020/map?place=fili-village',{waitUntil:'domcontentloaded'});await page.locator('.map-marker').first().waitFor({timeout:25000})
await page.locator('.map-page__frame').scrollIntoViewIfNeeded()
console.log(await page.locator('.map-canvas a').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent,label:e.getAttribute('aria-label'),width:r.width,height:r.height,coveredByCard:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('.map-place-card')!==null}})))
await browser.close()
