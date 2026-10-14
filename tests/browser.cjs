const {chromium} = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const assert = require('node:assert/strict');
const http = require('node:http');
const existsSync = require('node:fs').existsSync;
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'test-results');
const dist = path.join(root, 'dist');
let file;
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith('/worksheet/')) { res.writeHead(404).end(); return; }
    const relative = decodeURIComponent(url.pathname.slice('/worksheet/'.length)) || 'index.html';
    const target = path.resolve(dist, relative);
    if (!target.startsWith(dist + path.sep)) { res.writeHead(403).end(); return; }
    const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml'};
    res.setHeader('Content-Type', types[path.extname(target)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    res.end(await fs.readFile(target));
  } catch { res.writeHead(404).end(); }
});
async function run(name, executablePath) {
  const browser = await chromium.launch({executablePath, headless:true});
  const context = await browser.newContext({viewport:{width:1440,height:1100}});
  const page = await context.newPage();
  const errors=[], network=[], requests=[];
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (['http:', 'https:'].includes(url.protocol) && url.hostname !== '127.0.0.1') return route.abort();
    return route.continue();
  });
  page.on('pageerror', e => errors.push(String(e)));
  page.on('request', r => { requests.push(r.url()); if (/^https?:/.test(r.url()) && new URL(r.url()).hostname !== '127.0.0.1') network.push(r.url()); });
  try {
    await page.addInitScript(() => {
      window.__files=[]; window.__printCalls=[]; window.__printEvents=[];
      for (const type of ['beforeprint','afterprint']) window.addEventListener(type,()=>window.__printEvents.push(type));
      window.__nativePrint=window.print.bind(window);
      const original=HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click=function(){
        if(this.download && this.href.startsWith('blob:')) {
          const name=this.download;
          fetch(this.href).then(r=>r.blob()).then(blob=>{
            const reader=new FileReader();reader.onload=()=>window.__files.push({name,data:reader.result});reader.readAsDataURL(blob);
          });
        } else original.call(this);
      };
    });
    await page.goto(file);
    const ready=()=>page.waitForFunction(()=>!document.querySelector('#export-toggle').disabled);
    await ready();
    const paper=page.locator('#paper');
    assert.equal(await paper.locator('[data-answer-slot]').count(),80);
    assert.equal(await page.locator('#export-toggle').innerText(),'导出');
    assert.equal(await page.locator('#print-button').innerText(),'打印');
    const solved = await paper.innerHTML();
    assert.equal(requests.some(url => /\/pdf-[^/]+\.js/.test(url)), false, 'PDF eagerly loaded');
    let baseline;
    if (process.env.FMC_BASELINE) {
      baseline = await context.newPage();
      await baseline.goto(pathToFileURL(path.resolve(process.env.FMC_BASELINE)).href);
      await baseline.waitForFunction(() => !document.getElementById('export-toggle').disabled);
      assert.equal(await baseline.locator('#paper').innerHTML(), solved, 'Blank template changed');
    }
    // Exercise the native headless print call; actual printer confirmation is not automated.
    await page.locator('#print-button').click(); await ready();
    assert.equal(await page.locator('#print-sheet [data-answer-slot]').count(),80);
    assert.equal(await page.locator('#print-sheet').isVisible(),false);
    const nativeEvents=await page.evaluate(()=>window.__printEvents);
    assert.equal(requests.some(url => url.includes('/pdf-') && url.endsWith('.js')), false, 'Printing loaded PDF');
    assert.ok(nativeEvents.includes('beforeprint'));
    await page.pdf({path:path.join(out,name+'-blank-print.pdf'),preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
    await page.evaluate(()=>{
      window.print=()=>{
        window.dispatchEvent(new Event('beforeprint'));
        window.__printCalls.push({markup:document.querySelector('#print-sheet').innerHTML,disabled:['export-toggle','print-button','export-pdf','export-png'].every(id=>document.getElementById(id).disabled)});
        window.dispatchEvent(new Event('afterprint'));
      };
    });
    await page.locator('#export-toggle').click();
    assert.equal(await page.locator('#export-menu').isVisible(),true);
    assert.equal(await page.locator('#export-toggle').getAttribute('aria-expanded'),'true');
    assert.equal(await page.locator('#export-pdf').innerText(),'PDF 文件');
    await page.locator('#export-toggle').click();
    assert.equal(await page.locator('#export-menu').isVisible(),false);
    await page.locator('#export-toggle').focus(); await page.keyboard.press('ArrowDown');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'export-pdf');
    await page.keyboard.press('ArrowDown');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'export-png');
    await page.keyboard.press('Home'); assert.equal(await page.evaluate(()=>document.activeElement.id),'export-pdf');
    await page.keyboard.press('End'); assert.equal(await page.evaluate(()=>document.activeElement.id),'export-png');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#export-menu').isVisible(),false);
    assert.equal(await page.evaluate(()=>document.activeElement.id),'export-toggle');
    await page.keyboard.press('Enter'); await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'print-button');
    await page.locator('#export-toggle').click(); await page.locator('h1').click();
    assert.equal(await page.locator('#export-menu').isVisible(),false);
    async function exportPair(prefix, language) {
      for (const format of ['pdf','png']) {
        await ready(); await page.evaluate(()=>window.__files=[]);
        await page.locator('#export-toggle').click(); await page.locator('#export-'+format).click();
        assert.equal(await page.locator('#export-menu').isVisible(),false);
        await page.waitForFunction(()=>window.__files.length>0,null,{timeout:45000});
        const result=await page.evaluate(()=>window.__files[0]);
        assert.equal(result.name,`FMC-sheet-${language}.${format}`);
        await fs.writeFile(path.join(out,name+'-'+prefix+'.'+format),Buffer.from(result.data.split(',')[1],'base64'));
        await ready();
      }
    }
    await page.locator('#export-toggle').click(); await page.locator('#export-png').click();
    await page.waitForFunction(()=>window.__files.length>0,null,{timeout:45000}); await ready();
    assert.equal(requests.some(url => url.includes('/pdf-') && url.endsWith('.js')), false, 'PNG loaded PDF');
    if (name==='chrome') await exportPair('blank','zh');
    await page.locator('#competition').fill('周末练习 Weekend FMC');
    await page.locator('#competitor').fill('张三 / Alex');
    await page.locator('#round').fill('2'); await page.locator('#attempt').selectOption('3');
    await page.locator('#wcaId').fill('2020TEST01');
    await page.locator('#scramble').fill("R U R' U' F2 D2 L B'");
    for (const lang of ['zh','en']) {
      await page.locator('#lang-'+lang).click();
      assert.equal(await page.locator('#export-toggle').innerText(),lang==='zh'?'导出':'Export');
      assert.equal(await page.locator('#print-button').innerText(),lang==='zh'?'打印':'Print');
      const before=await paper.innerHTML();
      if (baseline) {
        for (const id of ['competition','competitor','round','wcaId','scramble']) await baseline.locator('#'+id).fill(await page.locator('#'+id).inputValue());
        await baseline.locator('#attempt').selectOption('3');
        await baseline.locator('#lang-'+lang).click();
        assert.equal(await baseline.locator('#paper').innerHTML(), before, lang+' template changed');
      }
      for(let i=0;i<2;i++) { await page.locator('#print-button').click(); await ready(); }
      assert.equal(await paper.innerHTML(),before);
      assert.equal(await page.locator('#competitor').inputValue(),'张三 / Alex');
      const latest=await page.evaluate(()=>window.__printCalls.at(-1));
      assert.equal(latest.disabled,true);
      assert.equal(latest.markup,before);
      assert.equal(await page.locator('#print-sheet [data-sticker]').count(),54);
      await page.emulateMedia({media:'print'});
      assert.equal(await page.locator('.editor').isVisible(),false);
      assert.equal(await page.locator('#print-sheet').isVisible(),true);
      const dims=await page.locator('#print-sheet').evaluate(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height}));
      assert.ok(Math.abs(dims.w-210*96/25.4)<1);assert.ok(Math.abs(dims.h-297*96/25.4)<1);
      await page.pdf({path:path.join(out,name+'-'+lang+'-print.pdf'),preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
      await page.emulateMedia({media:'screen'});
      if(name==='chrome' || lang==='en') await exportPair(lang,lang);
    }
    const printCount=await page.evaluate(()=>window.__printCalls.length);
    for(const invalid of ['x','r','Rw','M','R3','R ?']) {
      await page.locator('#scramble').fill(invalid);
      assert.equal(await page.locator('#export-toggle').isDisabled(),true);
      assert.equal(await page.locator('#print-button').isDisabled(),true);
    }
    assert.equal(await page.evaluate(()=>window.__printCalls.length),printCount);
    // Native keyboard printing must not print a stale cube when input is invalid.
    await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
    assert.equal(await page.locator('#print-sheet svg').count(),0);
    await page.locator('#clear-scramble').click(); await ready();
    await page.locator('#round').fill('0');
    assert.equal(await page.locator('#print-button').isDisabled(),true);
    await page.locator('#round').fill('2');await ready();
    await page.locator('#competition').fill('Long title '.repeat(120));
    assert.equal(await page.locator('#print-button').isDisabled(),true);
    await page.locator('#competition').fill('周末练习 Weekend FMC');await ready();
    await page.locator('#scramble').fill('R U '.repeat(100));
    assert.equal(await page.locator('#print-button').isDisabled(),true);
    await page.locator('#clear-scramble').click();await ready();
    // Failed print invocation must restore controls without clearing entries.
    await page.evaluate(()=>{window.print=()=>{throw Error('Test print unavailable')};});
    await page.locator('#print-button').click();await ready();
    assert.match(await page.locator('#toast').innerText(),/Could not open the print dialog/);
    await page.locator('#lang-zh').click();
    assert.match(await page.locator('#toast').innerText(),/无法打开打印对话框/);
    await page.setViewportSize({width:390,height:844});
    await page.locator('#export-toggle').click();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    const box=await page.locator('#export-menu').boundingBox();
    assert.ok(box.x>=0 && box.x+box.width<=390);
    await page.locator('.export-card').screenshot({path:path.join(out,name+'-menu-mobile.png')});
    await page.keyboard.press('Escape');
    assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
    await page.keyboard.press('Escape');
    await page.locator('#show-credits').click();
    await page.waitForFunction(()=>document.querySelectorAll('#credits-content details').length === 4);
    assert.match(await page.locator('#credits-content').textContent(), /MIT/);
    await page.locator('#credits-dialog button').click();
    const recovery = await context.newPage();
    await recovery.route('**/*.ttf', route => route.fulfill({status:503,body:'Test font failure'}));
    await recovery.goto(file);
    await recovery.locator('#retry-font').waitFor({state:'visible'});
    assert.equal(await recovery.locator('#print-button').isDisabled(),true);
    await recovery.unroute('**/*.ttf');
    await recovery.locator('#retry-font').click();
    await recovery.waitForFunction(()=>!document.getElementById('export-toggle').disabled);
    await recovery.route('**/pdf-*.js', route => route.abort());
    await recovery.locator('#export-toggle').click();await recovery.locator('#export-pdf').click();
    await recovery.waitForFunction(()=>!document.getElementById('export-toggle').disabled);
    assert.match(await recovery.locator('#toast').innerText(),/导出组件/);
    await recovery.unroute('**/pdf-*.js');
    await recovery.evaluate(()=>{window.__retriedDownloads=0;HTMLAnchorElement.prototype.click=function(){window.__retriedDownloads++;};});
    await recovery.locator('#competitor').fill('重试后保留的姓名');
    await recovery.locator('#export-toggle').click();await recovery.locator('#export-pdf').click();
    await recovery.waitForFunction(()=>window.__retriedDownloads===1,null,{timeout:45000});
    assert.equal(await recovery.locator('#competitor').inputValue(),'重试后保留的姓名');
    await recovery.waitForFunction(()=>!document.getElementById('export-toggle').disabled);
    // A missing async module must not disable the independent PNG/print features.
    await recovery.locator('#print-button').click();
    assert.equal(await recovery.locator('#print-sheet [data-answer-slot]').count(),80);
    await recovery.close();
    if (baseline) await baseline.close();
    console.log(JSON.stringify({browser:name,offline:true,menu:true,keyboard:true,exports:true,printLayout:true,printLifecycle:true,nativePrintEvents:nativeEvents,validation:true,mobile:true,errors,network}));
  } finally { await browser.close(); }
}
(async()=>{
  await fs.mkdir(out,{recursive:true});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  file = 'http://127.0.0.1:' + server.address().port + '/worksheet/';
  const chrome = process.env.CHROME_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/usr/bin/google-chrome'].find(existsSync);
  try { await run('chrome', chrome); }
  finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
})().catch(e=>{console.error(e);process.exitCode=1});
