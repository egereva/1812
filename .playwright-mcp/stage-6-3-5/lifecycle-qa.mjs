import assert from 'node:assert/strict'
import {writeFileSync} from 'node:fs'
import {chromium} from 'file:///C:/Users/infospice/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs'
const browser=await chromium.launch({executablePath:'C:/Users/infospice/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe'})
const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'})
const errors=[];page.on('pageerror',e=>errors.push(e.message))
await page.goto('http://localhost:3019/map',{waitUntil:'domcontentloaded'});await page.locator('.map-marker').first().waitFor({timeout:25000})
await page.evaluate(()=>{
  window.qa={maps:[],destroyed:0,listenerAdded:0,pointerAdded:0,pointerRemoved:0}
  const proto=window.ymaps3.YMap.prototype, set=proto.setLocation,destroy=proto.destroy,add=proto.addChild
  proto.setLocation=function(location){if(!window.qa.maps.includes(this))window.qa.maps.push(this);window.qa.active=this;return set.call(this,location)}
  proto.destroy=function(){window.qa.destroyed++;return destroy.call(this)}
  proto.addChild=function(child){if(child instanceof window.ymaps3.YMapListener)window.qa.listenerAdded++;return add.call(this,child)}
  const eventProto=EventTarget.prototype, listen=eventProto.addEventListener,remove=eventProto.removeEventListener
  eventProto.addEventListener=function(type,...args){if(type==='pointerdown'&&this.classList?.contains('map-canvas'))window.qa.pointerAdded++;return listen.call(this,type,...args)}
  eventProto.removeEventListener=function(type,...args){if(type==='pointerdown'&&this.classList?.contains('map-canvas'))window.qa.pointerRemoved++;return remove.call(this,type,...args)}
})
await page.locator('.map-page__layers button').nth(1).click();await page.locator('.map-page__layers button').first().click();await page.waitForTimeout(300)
// Drive real camera through a deterministic zoom cycle without changing source coordinates.
const snapshots=[]
for(const zoom of [15,12,15]){
  await page.evaluate(z=>window.qa.active.setLocation({zoom:z}),zoom);await page.waitForTimeout(500)
  const snapshot=await page.locator('.map-marker').evaluateAll(es=>es.map(e=>({title:e.title,cls:e.className,offset:e.parentElement.getAttribute('style')})))
  assert.ok(snapshot.filter(m=>m.cls.includes('map-marker-group')).length>=2)
  assert.ok(snapshot.some(m=>m.cls.includes('map-marker--1812'))&&snapshot.some(m=>m.cls.includes('map-marker--memory')))
  snapshots.push(snapshot)
}
assert.deepEqual(snapshots[0],snapshots[2])
const marker=page.locator('.map-marker:not(.map-marker-group)').first()
await marker.hover();await page.waitForTimeout(100)
const hover=await marker.locator('svg').evaluate(e=>({width:getComputedStyle(e).width,transform:getComputedStyle(e).transform,transition:getComputedStyle(e).transitionDuration}))
assert.ok(parseFloat(hover.transition)<0.001);assert.match(hover.transform,/1\.125/)
await page.keyboard.press('Tab');await marker.focus();assert.equal(await marker.evaluate(e=>getComputedStyle(e).outlineStyle),'solid')
await page.keyboard.press('Enter');await page.locator('.map-place-card').waitFor()
const selected=await page.locator('.map-marker.is-selected svg').evaluate(e=>getComputedStyle(e).transform);assert.match(selected,/1\.3125/)
await page.keyboard.press('Escape');await page.locator('.map-place-card').waitFor({state:'detached'})
// Actual pointer drag leaves the semantic URL unchanged and the canvas usable.
const box=await page.locator('.map-canvas').boundingBox();const before=page.url()
await page.mouse.move(box.x+box.width/2,box.y+100);await page.mouse.down();await page.mouse.move(box.x+box.width/2+100,box.y+150,{steps:8});await page.mouse.up();await page.waitForTimeout(300);assert.equal(page.url(),before)
for(const path of ['/places/fili-village','/timeline/council-fili','/']){
  await page.locator('.map-page__index summary').click().catch(()=>{})
  // Native app navigation, keeping the same JS document and memoized loader.
  await page.evaluate(path=>{const a=document.createElement('a');a.href=path;document.body.append(a);const router=document.querySelector('.map-page').__vueParentComponent.appContext.config.globalProperties.$router;router.push(path);a.remove()},path)
  await page.waitForURL(`http://localhost:3019${path}`);await page.locator('.map-canvas').waitFor({state:'detached'})
  assert.equal(await page.locator('script[data-map-api]').count(),1)
  await page.evaluate(()=>document.querySelector('main').__vueParentComponent.appContext.config.globalProperties.$router.push('/map'))
  await page.waitForURL('**/map');await page.locator('.map-marker').first().waitFor();await page.waitForTimeout(300)
  assert.equal(await page.locator('.map-canvas').count(),1);assert.equal(await page.locator('script[data-map-api]').count(),1)
}
const lifecycle=await page.evaluate(()=>({maps:window.qa.maps.length,destroyed:window.qa.destroyed,listenerAdded:window.qa.listenerAdded,pointerAdded:window.qa.pointerAdded,pointerRemoved:window.qa.pointerRemoved}))
assert.deepEqual(lifecycle,{maps:4,destroyed:3,listenerAdded:3,pointerAdded:3,pointerRemoved:3})
// Locale switch intentionally performs a same-tab document navigation to select API language.
await page.locator('.language-switch__link[lang="en"]').click();await page.waitForURL('**/en/map');await page.locator('.map-marker').first().waitFor({timeout:25000});assert.equal(await page.locator('.map-page__fallback').count(),0)
assert.deepEqual(errors,[])
writeFileSync('.playwright-mcp/stage-6-3-5/lifecycle-checks.json',JSON.stringify({lifecycle,zoomSnapshots:snapshots,hover,selected,errors},null,2))
await browser.close();console.log('PASS: zoom cycle, marker sizes/reduced motion/focus, pointer camera, four instances/three destroys, listener cleanup, single API script, locale switch')
