import assert from 'node:assert/strict'
import {mkdirSync} from 'node:fs'
import {chromium} from 'file:///C:/Users/infospice/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs'
const browser=await chromium.launch({executablePath:'C:/Users/infospice/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe'})
const page=await browser.newPage({viewport:{width:900,height:1000}}),requests=[]
page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url())})
await page.goto('file:///C:/Users/infospice/Desktop/1812/docs/research/homepage-real-static-map-proof.html')
assert.equal(await page.locator('svg').count(),4)
for(const svg of await page.locator('svg').all())assert.equal(await svg.locator('circle').count(),13)
assert.equal(await page.locator('a,button,[tabindex]').count(),0)
assert.deepEqual(requests,[])
mkdirSync('.playwright-mcp/homepage-real-static-map-proposal',{recursive:true})
await page.locator('.desktop').nth(1).screenshot({path:'.playwright-mcp/homepage-real-static-map-proposal/desktop-proof.png'})
await page.locator('.mobile320').screenshot({path:'.playwright-mcp/homepage-real-static-map-proposal/mobile320-proof.png'})
await browser.close();console.log('PASS audit proof: 13 points in each of four scenes; no external requests or interactive controls')
