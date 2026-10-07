import assert from 'node:assert/strict'
import {writeFileSync,readFileSync,existsSync} from 'node:fs'
import {chromium} from 'file:///C:/Users/infospice/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs'
import {getPlaces,getDynamicPrerenderRoutes} from '../../shared/content/index.ts'
const browser=await chromium.launch({executablePath:'C:/Users/infospice/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe'})
const results=[],errors=[]
for(const locale of ['ru','en'])for(const mode of ['missing-key','blocked-api','no-js']){
  const prefix=locale==='en'?'/en':'',port=mode==='missing-key'?3022:mode==='no-js'?3020:3019
  const context=await browser.newContext({javaScriptEnabled:mode!=='no-js',viewport:{width:390,height:1000}})
  const page=await context.newPage();page.on('pageerror',e=>errors.push({mode,locale,error:e.message}))
  const requests=[];page.on('request',r=>{if(/api-maps\.yandex/.test(r.url()))requests.push('Yandex API')})
  if(mode==='blocked-api')await page.route('**/api-maps.yandex.ru/**',route=>route.abort())
  await page.goto(`http://localhost:${port}${prefix}/map?event=council-fili`,{waitUntil:'domcontentloaded'})
  if(mode!=='no-js')await page.locator('.map-page__fallback').waitFor({timeout:25000})
  const navigation=page.locator(mode==='no-js'?'.map-page__index a':'.map-page__fallback a')
  assert.equal(await navigation.count(),13)
  assert.deepEqual(await navigation.evaluateAll(es=>es.map(e=>e.getAttribute('href').split('/').pop())),getPlaces(locale).map(p=>p.slug))
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
  if(mode!=='blocked-api')assert.deepEqual(requests,[])
  await page.locator('.map-page').screenshot({path:`.playwright-mcp/stage-6-3-5/${locale}-${mode}-fallback.png`})
  await navigation.first().focus();await page.keyboard.press('Enter');await page.waitForURL(`**${prefix}/places/fili-village`);assert.equal(context.pages().length,1)
  results.push({locale,mode,links:13,requests:requests.length,status:'PASS'})
  await context.close()
}
// Homepage must remain API-free on initial load, scroll and hover, in both locales.
for(const locale of ['ru','en']){
  const context=await browser.newContext(),page=await context.newPage(),requests=[]
  page.on('request',r=>{if(/yandex|yastatic/i.test(r.url()))requests.push('Yandex resource')})
  await page.goto(`http://localhost:3020/${locale==='en'?'en/':''}`,{waitUntil:'networkidle'})
  await page.locator('.home-map').scrollIntoViewIfNeeded();await page.locator('.home-map a').hover();await page.locator('.home-map a').focus();await page.waitForTimeout(500)
  assert.deepEqual(requests,[])
  assert.equal(await page.locator('.home-map__diagram [tabindex], .home-map__diagram a, .home-map__diagram button').count(),0)
  await page.keyboard.press('Enter');await page.waitForURL(`**/${locale==='en'?'en/':''}map`);assert.equal(context.pages().length,1)
  results.push({locale,mode:'homepage',yandexRequests:0,status:'PASS'});await context.close()
}
for(const route of getDynamicPrerenderRoutes())assert.ok(existsSync(`.output/public${route}/index.html`),route)
// Catalog invariants and no accidental production-content edits were checked separately.
assert.deepEqual(errors,[])
writeFileSync('.playwright-mcp/stage-6-3-5/resilience-checks.json',JSON.stringify({results,errors,dynamicRoutes:getDynamicPrerenderRoutes().length},null,2));await browser.close();console.log('PASS missing-key, blocked API, RU/EN static no-JS, 13 usable fallback routes, API-free Homepage, dynamic output')
