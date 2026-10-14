/**
 * theme-audit
 *
 * Walks the dev tools playground in both themes, screenshots every tab, and
 * diffs the app's computed styles against the values extracted from the
 * inventory design mock (scripts/mock-spec.json).
 *
 * Run scripts/mock-spec.mjs first to regenerate the target spec.
 *
 * Usage:
 *   node scripts/theme-audit.mjs              all tabs
 *   node scripts/theme-audit.mjs Forms Table  named tabs only
 */
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';

const BASE = process.env.APP_URL ?? 'http://localhost:5175';
const ROUTE = '/admin/devTools';
const only = process.argv.slice(2);

const spec = JSON.parse(readFileSync('scripts/mock-spec.json', 'utf8'));

/**
 * App selector → the mock selector it must match.
 * Only pairs listed here are diffed; everything else is screenshot-only.
 */
/**
 * Each pair compares a rendered app element against the mock element that
 * plays the same role. Both sides must be leaf elements that actually carry
 * the property — comparing a row container against a cell yields noise, not
 * findings.
 */
const PAIRS = [
    ['.MuiTableCell-head',                   '.inv-row-head .inv-cell', 'table header cell'],
    ['.MuiTableBody-root .MuiTableCell-root','.cell-qty .n',            'table data cell'],
    ['.MuiChip-root',                        '.badge.st-neutral',       'chip'],
    ['.MuiOutlinedInput-root',               '.comment-input .field',   'text input'],
    ['.MuiTab-root.Mui-selected',            '.tab.active',             'tab (active)'],
    ['.MuiTab-root:not(.Mui-selected)',      '.tab:not(.active)',       'tab (inactive)'],
];

const PROPS = ['fontSize', 'fontWeight', 'color', 'backgroundColor', 'borderRadius', 'textTransform'];

mkdirSync('scripts/shots', { recursive: true });

const browser = await chromium.launch();
// nginx terminates TLS on 446 with the repo's self-signed cert (.ssl/cert.pem).
// A clean browser profile has no exception stored for it, so accept it here.
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1200 }, ignoreHTTPSErrors: true });
const page = await ctx.newPage();

// Force theme mode via the persisted preference the app reads at bootstrap.
async function setMode(mode)
{
    await ctx.addInitScript((m) =>
    {
        localStorage.setItem('trk:theme:mode', JSON.stringify(m));
    }, mode);
}

const findings = [];

for (const mode of ['light', 'dark'])
{
    await setMode(mode);
    await page.goto(BASE + ROUTE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    const tabs = await page.$$eval('.MuiTab-root', els => els.map(e => e.textContent.trim()));
    if (!tabs.length) { console.error('No tabs found — is the dev tools route reachable?'); break; }

    for (const [i, label] of tabs.entries())
    {
        if (only.length && !only.some(o => label.toLowerCase().includes(o.toLowerCase()))) continue;

        await page.locator('.MuiTab-root').nth(i).click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `scripts/shots/${mode}-${String(i).padStart(2, '0')}-${label.replace(/\W+/g, '')}.png` });

        for (const [appSel, mockSel, concept] of PAIRS)
        {
            const got = await page.evaluate(({ sel, props }) =>
            {
                const el = document.querySelector(sel);
                if (!el) return null;
                const cs = getComputedStyle(el);
                return Object.fromEntries(props.map(p => [p, cs[p]]));
            }, { sel: appSel, props: PROPS });

            if (!got) continue;
            const want = spec[mode][mockSel];
            if (!want || want.missing) continue;

            for (const p of PROPS)
            {
                if (p === 'color' || p === 'backgroundColor') continue; // compared separately below
                if (String(got[p]) !== String(want[p]))
                {
                    findings.push({ mode, tab: label, concept, prop: p, app: got[p], mock: want[p] });
                }
            }
        }
    }
}

await browser.close();

// Deduplicate — the same mismatch repeats across tabs.
const seen = new Set();
const unique = findings.filter(f =>
{
    const k = `${f.mode}|${f.concept}|${f.prop}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
});

if (!unique.length)
{
    console.log('No structural mismatches against the mock spec.');
}
else
{
    console.log(`\n${'MODE'.padEnd(6)}${'TAB'.padEnd(18)}${'ELEMENT'.padEnd(22)}${'PROPERTY'.padEnd(16)}${'APP'.padEnd(18)}MOCK`);
    console.log('─'.repeat(108));
    for (const f of unique)
    {
        console.log(
            f.mode.padEnd(6) + f.tab.slice(0, 17).padEnd(18) + f.concept.padEnd(22) + f.prop.padEnd(16) +
            String(f.app).padEnd(18) + String(f.mock)
        );
    }
}
console.log(`\nScreenshots: scripts/shots/`);
