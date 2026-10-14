/**
 * mock-spec
 *
 * Reads the inventory design mock in a real browser and dumps the computed
 * style of every element that has an equivalent in the app, for both themes.
 *
 * This turns the mock from something we eyeball into a table of exact target
 * values, so theme work is a diff rather than a guess.
 *
 * Usage: node scripts/mock-spec.mjs [path-to-mock.html]
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const MOCK = process.argv[2]
    ?? '/home/jumpylion/dev/planmaketrace-marketing-traction/public/images/mocks/inventory-view.html';

/** Selector → the app concept it maps onto. */
const TARGETS = {
    'body':                      'page background',
    '.main':                     'content surface',
    '.header h1':                'page title',
    '.tab:not(.active)':         'tab (inactive)',
    '.tab.active':               'tab (active)',
    '.search':                   'search input',
    '.inv-row-head':             'table header row',
    '.inv-row-head .inv-cell':   'table header cell',
    '.inv-row-body':             'table data row',
    '.inv-row-body.selected':    'table row (selected)',
    '.name':                     'primary cell text',
    '.cell-manufacturer':        'secondary cell text',
    '.cell-qty .n':              'numeric cell',
    '.cell-qty .u':              'numeric unit',
    '.badge.st-neutral':         'chip / neutral',
    '.badge.st-success':         'chip / success',
    '.badge.st-danger':          'chip / danger',
    '.panel-head h3':            'panel title',
    '.panel-manufacturer':       'panel subtitle',
    '.section-title':            'section label',
    '.lifecycle-item .lbl':      'field label',
    '.lifecycle-item .val':      'field value',
    '.lotchip':                  'code chip',
    '.qty-group .value':         'metric figure',
    '.comment-input .field':     'text input',
    '.comment-input .send':      'primary action button',
    '.rowcheck':                 'checkbox',
    '.type-icon':                'icon tile',
};

const PROPS = [
    'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textTransform',
    'color', 'backgroundColor',
    'borderTopWidth', 'borderTopColor', 'borderBottomWidth', 'borderBottomColor', 'borderRadius',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'height', 'gap',
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto(pathToFileURL(MOCK).href, { waitUntil: 'networkidle' });

const spec = {};

for (const mode of ['light', 'dark'])
{
    await page.evaluate((m) =>
    {
        document.getElementById('main-stage').dataset.theme = m === 'dark' ? 'dark' : '';
    }, mode);

    spec[mode] = await page.evaluate(({ targets, props }) =>
    {
        const out = {};
        for (const [sel, concept] of Object.entries(targets))
        {
            const el = document.querySelector(sel);
            if (!el) { out[sel] = { concept, missing: true }; continue; }
            const cs = getComputedStyle(el);
            const vals = {};
            for (const p of props) vals[p] = cs[p];
            out[sel] = { concept, ...vals };
        }
        // The design tokens themselves, straight off :root.
        const root = getComputedStyle(document.getElementById('main-stage'));
        const tokens = {};
        for (const name of Array.from(document.styleSheets)
            .flatMap(s => { try { return Array.from(s.cssRules); } catch { return []; } })
            .filter(r => r.style)
            .flatMap(r => Array.from(r.style))
            .filter(n => n.startsWith('--')))
        {
            tokens[name] = root.getPropertyValue(name).trim();
        }
        out.__tokens = tokens;
        return out;
    }, { targets: TARGETS, props: PROPS });

    await page.screenshot({ path: `scripts/shots/mock-${mode}.png`, fullPage: false });
}

writeFileSync('scripts/mock-spec.json', JSON.stringify(spec, null, 2));
await browser.close();

// Human-readable summary
for (const mode of ['light', 'dark'])
{
    console.log(`\n──────── ${mode.toUpperCase()} ────────`);
    for (const [sel, v] of Object.entries(spec[mode]))
    {
        if (sel === '__tokens' || v.missing) continue;
        console.log(
            `${v.concept.padEnd(24)} ${String(v.fontSize).padStart(7)}  w${String(v.fontWeight).padEnd(4)}` +
            ` ${String(v.color).padEnd(22)} bg ${String(v.backgroundColor).padEnd(24)} r${v.borderRadius}`
        );
    }
}
console.log('\nTokens (light):');
console.log(JSON.stringify(spec.light.__tokens, null, 2));
