/**
 * auth-setup
 *
 * Logs in once and saves the browser storage state, so the audit and any
 * other script can reach authenticated pages without handling credentials.
 *
 * Credentials come from .env.local (E2E_EMAIL / E2E_PASSWORD) and are never
 * written anywhere. The resulting state file holds a session token, so it is
 * gitignored and should be treated like one.
 *
 * Re-run when the session expires.
 *
 *   node scripts/auth-setup.mjs
 */
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';

const BASE = process.env.APP_URL ?? 'https://192.168.1.104:446';
const STATE = 'scripts/.auth/state.json';

/** Minimal .env reader — avoids a dependency for four lines of parsing. */
function readEnv(file)
{
    const out = {};
    try
    {
        for (const line of readFileSync(file, 'utf8').split('\n'))
        {
            const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
            if (match) out[match[1]] = match[2].replace(/^["']|["']$/g, '');
        }
    }
    catch { /* file is optional — env vars may be set directly */ }
    return out;
}

const env = { ...readEnv('.env.local'), ...process.env };
const email = env.E2E_EMAIL;
const password = env.E2E_PASSWORD;

if (!email || !password)
{
    console.error('Missing E2E_EMAIL / E2E_PASSWORD in .env.local');
    process.exit(1);
}

mkdirSync('scripts/.auth', { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1500, height: 1000 }, ignoreHTTPSErrors: true });
const page = await ctx.newPage();

await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' });

await page.getByRole('textbox', { name: /email/i }).fill(email);
await page.locator('input[type="password"]').fill(password);
await page.getByRole('button', { name: /^login$/i }).click();

// Landing anywhere other than /auth means the session took.
await page.waitForURL(url => !url.pathname.startsWith('/auth'), { timeout: 20000 })
    .catch(() => { throw new Error('Login did not navigate away from /auth — check the credentials'); });

await page.waitForTimeout(1500);
await ctx.storageState({ path: STATE });
await browser.close();

console.log(`Signed in. Session saved to ${STATE}`);
