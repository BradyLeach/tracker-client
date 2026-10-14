import { chromium } from 'playwright';
const b = await chromium.launch();
for (const mode of ['light','dark']) {
  const ctx = await b.newContext({ viewport:{width:1400,height:900}, ignoreHTTPSErrors:true });
  await ctx.addInitScript(m => localStorage.setItem('trk:theme:mode', JSON.stringify(m)), mode);
  const p = await ctx.newPage();
  await p.goto('https://192.168.1.104:446/admin/devTools', { waitUntil:'networkidle' });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `scripts/shots/tab-${mode}.png` });
  await ctx.close();
}
await b.close(); console.log('ok');
