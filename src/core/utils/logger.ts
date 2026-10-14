import { getConfig } from '@/config';

type Level = 'debug' | 'info' | 'warn' | 'error';

const RANK: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };
 
const log = ( level: Level, fn: ( ...a: any[] ) => void ) => ( ...args: any[] ) =>
{
    const { monitoring } = getConfig();
    if( monitoring.enableLogging && RANK[level] >= RANK[monitoring.logLevel as Level] )
    {
        fn( `[${level.toUpperCase()}]`, ...args );
    }
};

export const logger = {
    debug: log( 'debug', console.debug ),
    info:  log( 'info', console.info ),
    warn:  log( 'warn', console.warn ),
    error: log( 'error', console.error ),
};

export const performanceLogger = {
    start: ( operation: string ) =>
    {
        const startTime = performance.now();
        return {
            end: ( data?: Record<string, unknown> ) =>
            {
                const duration = Math.round( ( performance.now() - startTime ) * 100 ) / 100;
                logger.info( `${operation} completed`, { duration, ...data } );
                return { duration };
            }
        };
    }
};
