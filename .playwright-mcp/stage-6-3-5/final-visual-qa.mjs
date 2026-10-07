import assert from 'node:assert/strict'
import {writeFileSync} from 'node:fs'
import {chromium} from 'file:///C:/Users/infospice/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs'
const browser=await chromium.launch({executablePath:'C:/Users/infospice/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe'})
const results=[],errors=[]
for(const locale of ['ru','en'])for(const width of [320,390,768,1440]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message))
  const prefix=locale==='en'?'/en':''
  await page.goto(`http://localhost:3020${prefix}/map?place=fili-village`,{waitUntil:'domcontentloaded'})
  await page.locator('.map-marker').first().waitFor({timeout:25000});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(2500)
  await page.locator('.map-page__frame').scrollIntoViewIfNeeded()
  const attribution=await page.locator('.map-canvas a').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();const top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {text:e.textContent,width:r.width,height:r.height,cardCovers:!!top?.closest('.map-place-card'),visible:!!top?.closest('.map-canvas')}}))
  assert.ok(attribution.length>=2);assert.ok(attribution.every(a=>!a.cardCovers&&a.visible))
  assert.equal(await page.locator('.map-member-chooser').count(),0)
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
  if(width<=850)assert.equal(await page.locator('.map-place-card').evaluate(e=>getComputedStyle(e).bottom),'44px')
  const link=page.locator('.map-place-card__link');await link.scrollIntoViewIfNeeded();assert.ok(await link.isVisible());await page.locator('.map-place-card').evaluate(e=>e.scrollTop=0)
  await page.locator('.map-page').screenshot({path:`.playwright-mcp/stage-6-3-5/${locale}-${width}-final-selected.png`})
  await page.locator('.map-place-card__close').click();await page.locator('.map-place-card').waitFor({state:'detached'})
  await page.locator('.map-page__index summary').click();await page.locator('.map-page__legend summary').click()
  await page.evaluate(()=>document.activeElement?.blur());await page.waitForTimeout(100)
  await page.locator('.map-page').screenshot({path:`.playwright-mcp/stage-6-3-5/${locale}-${width}-final-index-legend.png`})
  if(width===390){
    await page.goto(`http://localhost:3020${prefix}/map?event=council-fili`,{waitUntil:'domcontentloaded'});await page.locator('.map-marker-group').first().waitFor({timeout:25000})
    await page.locator('.map-marker-group').first().click();await page.locator('.map-member-chooser button').first().click()
    assert.equal(await page.locator('.map-member-chooser').count(),0);assert.equal(await page.locator('.map-page__event').count(),1)
    await page.locator('.map-page').screenshot({path:`.playwright-mcp/stage-6-3-5/${locale}-390-final-event-selected.png`})
    await page.locator('.map-place-card__close').focus();await page.keyboard.press('Escape');await page.locator('.map-place-card').waitFor({state:'detached'})
    await page.locator('.map-marker-group').first().click();await page.locator('.map-member-chooser').waitFor()
  }
  results.push({locale,width,attribution,overflow:false,chooserSuppressed:true});await page.close()
}
assert.deepEqual(errors,[]);writeFileSync('.playwright-mcp/stage-6-3-5/final-visual-checks.json',JSON.stringify({results,errors},null,2));await browser.close();console.log('PASS final static RU/EN four-width card/attribution checks and event-card regression')
