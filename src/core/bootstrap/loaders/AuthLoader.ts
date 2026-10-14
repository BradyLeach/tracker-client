import type { BootstrapLoader } from '../types';
import { refreshAuth } from '@/services/http/api';

export interface AuthConfig
{
    isAuthenticated: boolean;
}

export class AuthLoader implements BootstrapLoader<AuthConfig>
{
    name = 'auth';
    critical = false; // App must render even without a session

    async load(): Promise<AuthConfig>
    {
        const response = await refreshAuth();

        if( response.status !== 200 )
        {
            return { isAuthenticated: false };
        }

        // Token captured by the token-capture interceptor.
        // Context hydration deferred to ContextDefaults (runs after React mounts).
        return { isAuthenticated: true };
    }
}
