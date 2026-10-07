import { chromium } from 'file:///C:/Users/infospice/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs'
const browser=await chromium.launch({executablePath:'C:/Users/infospice/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe'})
const page=await browser.newPage({viewport:{width:1440,height:1100}})
page.on('pageerror', e=>console.log('page exception:',e.message))
await page.goto('http://localhost:3019/map',{waitUntil:'domcontentloaded'})
await page.waitForTimeout(7000)
console.log(await page.evaluate(()=>({state:document.querySelector('.map-page__state')?.textContent,markers:document.querySelectorAll('.map-marker').length,groups:[...document.querySelectorAll('.map-marker-group')].map(e=>e.getAttribute('aria-label')),script:document.querySelectorAll('script[data-map-api]').length,index:document.querySelector('.map-page__index').textContent,provider:[...document.querySelectorAll('.map-canvas a')].map(e=>({text:e.textContent,host:new URL(e.href).host}))})))
await page.locator('.map-page__experience').screenshot({path:'.playwright-mcp/stage-6-3-5/probe.png'})
await browser.close()
