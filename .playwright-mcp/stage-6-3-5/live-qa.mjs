import assert from 'node:assert/strict'
import {writeFileSync} from 'node:fs'
import {chromium} from 'file:///C:/Users/infospice/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs'
import {getPlaces,getTimelineEvents,getDictionaryEntries,resolveRelatedContent} from '../../shared/content/index.ts'
const browser=await chromium.launch({executablePath:'C:/Users/infospice/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe'})
const root='.playwright-mcp/stage-6-3-5', origin='http://localhost:3019'
const results=[],errors=[]
const layerFor=p=>['event-site','surviving-witness','lost-site'].includes(p.historicalStatus)?'1812':'memory'
async function ready(page){await page.locator('.map-marker').first().waitFor({timeout:25000});await page.waitForTimeout(250)}
async function index(page,places){assert.deepEqual(await page.locator('.map-page__index a').evaluateAll(es=>es.map(e=>e.getAttribute('href').split('/').pop())),places.map(p=>p.slug))}
async function noOverflow(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)}
async function shot(page,name,selector='.map-page'){await page.evaluate(()=>document.activeElement?.blur());await page.locator(selector).screenshot({path:`${root}/${name}.png`})}
for(const locale of ['ru','en']){
  const prefix=locale==='en'?'/en':'', places=getPlaces(locale), messages=JSON.parse((await import('node:fs')).readFileSync(`i18n/locales/${locale}.json`,'utf8'))
  const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'})
  page.on('pageerror',e=>errors.push({locale,message:e.message}))
  await page.goto(`${origin}${prefix}/map`,{waitUntil:'domcontentloaded'});await ready(page)
  await index(page,places)
  assert.equal(await page.locator('.map-page__legend details').getAttribute('open'),null)
  for(const [i,layer] of ['all','1812','memory'].entries()){
    await page.locator('.map-page__layers button').nth(i).click();await page.waitForTimeout(300)
    const expected=places.filter(p=>layer==='all'||layerFor(p)===layer);await index(page,expected)
    const markers=await page.locator('.map-marker').evaluateAll(es=>es.map(e=>({class:e.className,label:e.getAttribute('aria-label')})))
    assert.ok(markers.length>0)
    if(layer!=='all')assert.ok(markers.every(m=>m.class.includes(`map-marker--${layer}`)))
    await noOverflow(page)
  }
  await page.locator('.map-page__layers button').first().click();await page.waitForTimeout(200)
  await page.locator('.map-marker-group').first().focus();await page.keyboard.press('Enter')
  await page.locator('.map-member-chooser').waitFor()
  assert.equal(await page.locator('.map-member-chooser button').first().evaluate(e=>e===document.activeElement),true)
  const memberTitles=await page.locator('.map-member-chooser button:not(:last-child)').allTextContents()
  assert.ok(memberTitles.length>1)
  await page.keyboard.press('Enter');await page.locator('.map-place-card').waitFor()
  assert.equal(await page.locator('.map-member-chooser').count(),0)
  assert.equal(await page.locator('.map-place-card h2').evaluate(e=>e===document.activeElement),true)
  await page.keyboard.press('Escape');await page.locator('.map-place-card').waitFor({state:'detached'})
  assert.equal(await page.locator('.map-marker:focus').count(),1)
  // All thirteen localized cards are checked, spanning every approved status and media condition.
  for(const place of places){
    await page.goto(`${origin}${prefix}/map?place=${place.slug}`,{waitUntil:'domcontentloaded'});await ready(page)
    assert.equal(await page.locator('.map-place-card h2').textContent(),place.title)
    assert.equal(await page.locator('.map-place-card__lead').textContent(),place.shortDescription)
    assert.equal(await page.locator('.map-place-card .eyebrow').textContent(),messages.map.status[place.historicalStatus])
    assert.equal(await page.locator('.map-place-card img').count(),place.coverImage?1:0)
    if(place.coverImage){assert.equal(await page.locator('.map-place-card img').getAttribute('alt'),place.coverImage.alt);assert.equal(await page.locator('.map-place-card img').getAttribute('loading'),'lazy')}
    const note=place.locationNote??place.historicalNote
    if(note)assert.equal(await page.locator('.map-place-card__note').textContent(),note)
    assert.equal(await page.locator('.map-place-card__link').getAttribute('href'),`${prefix}/places/${place.slug}`)
    assert.equal(await page.locator('.map-place-card__link').getAttribute('target'),null)
    assert.equal(await page.locator('.map-member-chooser').count(),0)
    await noOverflow(page)
  }
  // URL matrix, selected card coherence across layers, history and reload.
  for(const [query,card,event] of [['',false,false],['?place=invalid-place',false,false],['?event=invalid-event',false,false],['?event=council-fili',false,true],['?place=kutuzov-hut&event=council-fili',true,false]]){
    await page.goto(`${origin}${prefix}/map${query}`,{waitUntil:'domcontentloaded'});await ready(page)
    assert.equal(await page.locator('.map-place-card').count(),Number(card));assert.equal(await page.locator('.map-page__event').count(),Number(event))
    assert.equal(await page.locator('.map-page__layers').count(),Number(!event))
  }
  await page.locator('.map-page__layers button').nth(1).click();await page.waitForTimeout(250)
  assert.equal(await page.locator('.map-place-card').count(),0);await index(page,places.filter(p=>layerFor(p)==='1812'))
  await page.goBack();await page.locator('.map-place-card').waitFor()
  await page.goForward();await page.locator('.map-place-card').waitFor({state:'detached'})
  await page.reload({waitUntil:'domcontentloaded'});await ready(page);await index(page,places.filter(p=>layerFor(p)==='1812'))
  for(const slug of ['council-fili','borodino']){
    const event=getTimelineEvents(locale).find(e=>e.slug===slug), related=resolveRelatedContent(locale,'timeline',event.id).places
    await page.goto(`${origin}${prefix}/timeline/${slug}`,{waitUntil:'domcontentloaded'})
    const cta=page.locator('.timeline-detail__map-link');assert.equal(await cta.getAttribute('href'),`${prefix}/map?event=${slug}`);assert.equal(await cta.getAttribute('target'),null)
    await cta.click();await ready(page);await index(page,related)
    assert.equal(await page.locator('.map-place-card').count(),0)
    assert.equal(await page.locator('.map-page__event-title').textContent(),event.title)
    assert.equal(await page.locator('.map-page__event-title').evaluate(e=>e.tagName),'SPAN')
    assert.equal(await page.locator('.map-page__layers').count(),0)
    await page.locator('.map-marker-group').first().click();await page.locator('.map-member-chooser button').first().click()
    await page.locator('.map-place-card').waitFor();assert.ok(page.url().endsWith(`?event=${slug}`));assert.equal(await page.locator('.map-member-chooser').count(),0)
    await page.locator('.map-place-card__close').click();await page.locator('.map-place-card').waitFor({state:'detached'});assert.equal(await page.locator('.map-page__event').count(),1)
    await page.locator('.map-page__event-exit').click();await page.locator('.map-page__layers').waitFor();await index(page,places)
    await page.goBack();await page.locator('.map-page__event').waitFor();assert.equal(await page.locator('.map-place-card').count(),0)
    await page.goForward();await page.locator('.map-page__layers').waitFor()
  }
  for(const slug of ['fili-village','kutuzov-hut','poklonnaya-hill']){
    await page.goto(`${origin}${prefix}/places/${slug}`,{waitUntil:'domcontentloaded'})
    const cta=page.locator(`a[href="${prefix}/map?place=${slug}"]`);assert.equal(await cta.getAttribute('target'),null)
    await cta.click();await ready(page);assert.equal(await page.locator('.map-place-card h2').textContent(),places.find(p=>p.slug===slug).title)
    await page.goBack();await page.waitForURL(`**/places/${slug}`);await page.goForward();await ready(page);assert.equal(await page.locator('.map-place-card').count(),1)
  }
  for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:1100})
    await page.goto(`${origin}${prefix}/map`,{waitUntil:'domcontentloaded'});await ready(page);await noOverflow(page)
    await page.locator('.map-page__index summary').click()
    assert.equal(await page.locator('.map-page__index ol').evaluate(e=>getComputedStyle(e).columnCount),width<=600?'1':width<=850?'2':'3')
    assert.ok((await page.locator('.map-page__index a').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().height))).every(h=>h>=44))
    await page.locator('.map-page__legend summary').focus();await page.keyboard.press('Enter')
    assert.equal(await page.locator('.map-page__legend li').count(),2)
    await shot(page,`${locale}-${width}-normal-index-legend`)
    await page.locator('.map-marker-group').first().click();await page.locator('.map-member-chooser').waitFor()
    if(width===390)await shot(page,`${locale}-${width}-chooser`)
    await page.locator('.map-member-chooser button').first().click();await page.locator('.map-place-card').waitFor()
    assert.equal(await page.locator('.map-member-chooser').count(),0);await noOverflow(page)
    await shot(page,`${locale}-${width}-selected`)
    await page.locator('.map-place-card__close').click();await page.locator('.map-place-card').waitFor({state:'detached'})
    await page.goto(`${origin}${prefix}/map?event=council-fili`,{waitUntil:'domcontentloaded'});await ready(page);await noOverflow(page)
    await shot(page,`${locale}-${width}-event`)
    await page.goto(`${origin}${prefix}/`,{waitUntil:'domcontentloaded'});await page.locator('.home-map').waitFor();await noOverflow(page)
    assert.equal((await page.locator('.home-map').textContent()).includes('04 / 04'),false)
    await shot(page,`${locale}-${width}-homepage`,'.home-map')
    for(const slug of ['bagration','kutuzov','fili','alexander-i']){
      const record=getDictionaryEntries(locale).find(e=>e.slug===slug);const related=resolveRelatedContent(locale,'dictionary',record.id).places
      await page.goto(`${origin}${prefix}/dictionary/${slug}`,{waitUntil:'domcontentloaded'});await noOverflow(page)
      assert.equal(await page.locator('.dictionary-detail__places a').count(),related.length)
      if(slug==='fili')await shot(page,`${locale}-${width}-dictionary`,'.dictionary-detail__places')
    }
  }
  assert.equal(await page.locator('h1').count(),1)
  results.push({locale,places:13,layers:[13,6,7],cards:13,events:['council-fili','borodino'],widths:[320,390,768,1440],status:'PASS'})
  await page.close()
}
assert.deepEqual(errors,[])
writeFileSync(`${root}/live-checks.json`,JSON.stringify({results,errors},null,2));await browser.close();console.log('PASS integrated RU/EN live matrix, 26 cards, navigation/history, four responsive widths')
