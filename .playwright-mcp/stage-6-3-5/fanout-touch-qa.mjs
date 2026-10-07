import assert from 'node:assert/strict'
import {writeFileSync} from 'node:fs'
import {chromium} from 'file:///C:/Users/infospice/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs'
const browser=await chromium.launch({executablePath:'C:/Users/infospice/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe'})
const page=await browser.newPage({viewport:{width:390,height:1000},hasTouch:true,reducedMotion:'reduce'})
const errors=[];page.on('pageerror',e=>errors.push(e.message))
await page.goto('http://localhost:3020/map',{waitUntil:'domcontentloaded'});await page.locator('.map-marker').first().waitFor({timeout:25000})
await page.evaluate(()=>{const proto=window.ymaps3.YMap.prototype,set=proto.setLocation;proto.setLocation=function(location){window.qaMap=this;return set.call(this,location)}})
await page.locator('.map-page__layers button').nth(1).tap();await page.locator('.map-page__layers button').first().tap();await page.waitForTimeout(250)
async function open(){await page.evaluate(()=>window.qaMap.setLocation({center:[37.522,55.741],zoom:13}));await page.waitForTimeout(300);await page.locator('.map-marker-group').first().tap();await page.locator('.map-member-chooser').waitFor()}
await open()
const members=await page.locator('.map-member-chooser button:not(:last-child)').allTextContents()
const first=await page.locator('.map-marker:not(.map-marker-group)').evaluateAll(es=>es.map(e=>({title:e.title,offset:e.parentElement.getAttribute('style')})))
await page.locator('.map-member-chooser button').last().tap();await open()
const second=await page.locator('.map-marker:not(.map-marker-group)').evaluateAll(es=>es.map(e=>({title:e.title,offset:e.parentElement.getAttribute('style')})))
assert.deepEqual(first,second)
for(const title of members){
  await page.locator('.map-member-chooser').getByRole('button',{name:title,exact:true}).tap();await page.locator('.map-place-card').waitFor()
  assert.equal(await page.locator('.map-place-card h2').textContent(),title);assert.equal(await page.locator('.map-member-chooser').count(),0)
  await page.locator('.map-place-card__close').tap();await page.locator('.map-place-card').waitFor({state:'detached'});await open()
}
assert.equal(new Set(await page.locator('.map-marker').evaluateAll(es=>es.map(e=>e.title))).size,await page.locator('.map-marker').count())
assert.deepEqual(errors,[])
writeFileSync('.playwright-mcp/stage-6-3-5/fanout-touch-checks.json',JSON.stringify({members,deterministic:true,noGhosts:true,errors},null,2));await browser.close();console.log(`PASS touch chooser/card/close for all ${members.length} group members; deterministic fan-out; no ghost markers`)
