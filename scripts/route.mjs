/**
 * route
 *
 * Screenshots one route in both themes.
 *
 *   node scripts/route.mjs /partnerships/<id>
 *
 * Two things this has to work around, both learned the hard way:
 *
 * Theme cannot be set through localStorage on an authenticated page. The app
 * hydrates preferences from the server after login and those always win
 * (hydrateFromAuthContext), so an init script writing `trk:theme:mode` is
 * overwritten before first paint. The theme is toggled through the app's own
 * control instead, which is the only thing that actually changes it.
 *
 * Both passes share one browser context. Refreshing rotates the session token,
 * so a second context restoring the same saved state authenticates with a token
 * the first pass already replaced, and lands on /auth/login.
 */
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';

const route = process.argv[2] ?? '/partnerships';
const BASE = process.env.APP_URL ?? 'https://192.168.1.104:446';
const STATE = 'scripts/.auth/state.json';

const browser = await chromium.launch();
const context = await browser.newContext( {
    viewport: { width: 1500, height: 950 },
    ignoreHTTPSErrors: true,
    ...( existsSync( STATE ) ? { storageState: STATE } : {} ),
} );

const page = await context.newPage();
await page.goto( BASE + route, { waitUntil: 'networkidle' } );
await page.waitForTimeout( 2000 );

if( page.url().includes( '/auth/login' ) )
{
    console.error( 'Not signed in — run: node scripts/auth-setup.mjs' );
    await browser.close();
    process.exit( 1 );
}

/** The toggle is labelled with the mode it will switch *to*, so it names the other one. */
const toggle = page.getByRole( 'button', { name: /^(light|dark) mode$/i } );

for( const pass of [1, 2] )
{
    // Whichever mode we are in now — read from the toggle, which names the other one.
    const label = await toggle.getAttribute( 'aria-label' ) ?? '';
    const mode = /light/i.test( label ) ? 'dark' : 'light';

    await page.screenshot( { path: `scripts/shots/route-${mode}.png` } );
    console.log( mode, '→', page.url() );

    // Second pass has nothing left to switch to.
    if( pass === 2 ) break;

    await toggle.click();
    await page.waitForTimeout( 1500 );
}

await context.close();
await browser.close();
