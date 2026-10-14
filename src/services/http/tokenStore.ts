/**
 * In-memory storage for the JWT access token.
 *
 * - No localStorage/sessionStorage (XSS-vulnerable)
 * - Module-scope variable only
 * - Token is lost on page refresh (by design — refresh flow is a separate concern)
 */

let accessToken: string | null = null;

export const tokenStore = {
    get: (): string | null => accessToken,
    set: ( token: string ): void => { accessToken = token; },
    clear: (): void => { accessToken = null; },
};
