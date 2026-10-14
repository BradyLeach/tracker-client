/**
 * ErrorBoundary – Centralized error boundary for component/page-level failures
 *
 * Captures unhandled render errors and delegates display to FullPageError.
 *
 * Responsibilities:
 * - Catch and log render-time exceptions
 * - Assign errorId for tracking and debugging
 * - Invoke global error reporter if available
 * - Render fallback if provided, or <FullPageError /> as default
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { getConfig } from '@/config';
import { logger } from '@/core/utils/logger';
import { FullPageError } from '@/components/pages/FullPageError';

interface ErrorBoundaryProps
{
    children: ReactNode;
    fallback?: ReactNode;
    onError?: ( error: Error, errorInfo: ErrorInfo, errorId: string ) => void;
    level?: 'page' | 'component' | 'critical';
}

interface ErrorBoundaryState
{
    hasError: boolean;
    errorId?: string;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState>
{
    constructor( props: ErrorBoundaryProps )
    {
        super( props );
        this.state = { hasError: false };
    }

    static getDerivedStateFromError( error: Error ): ErrorBoundaryState
    {
        const errorId = `err_${Date.now()}_${Math.random().toString( 36 ).slice( 2, 9 )}`;
        return {
            hasError: true,
            error,
            errorId,
        };
    }

    componentDidCatch( error: Error, errorInfo: ErrorInfo ): void
    {
        const { level = 'component' } = this.props;
        const { errorId } = this.state;

        logger.error( 'Error boundary caught error', {
            errorId,
            errorMessage: error.message,
            errorStack: error.stack,
            componentStack: errorInfo.componentStack,
            level,
        } );

        if( this.isErrorReportingEnabled() )
        {
            this.reportError( error, errorInfo, errorId! );
        }

        this.props.onError?.( error, errorInfo, errorId! );
        this.setState( { errorInfo } ); // Optional if not used
    }

    private isErrorReportingEnabled(): boolean
    {
        try
        {
            return getConfig().features?.errorReporting ?? false;
        }
        catch
        {
            return false;
        }
    }

    private reportError( error: Error, errorInfo: ErrorInfo, errorId: string ): void
    {
        if( window.errorReporting?.captureException )
        {
            window.errorReporting.captureException( error, {
                extra: {
                    errorInfo,
                    errorId,
                    level: this.props.level,
                    timestamp: new Date().toISOString(),
                },
            } );
        }
        else
        {
            logger.warn( 'Error reporting not configured', { errorId, level: this.props.level } );
        }
    }

    private handleRetry = () =>
    {
        this.setState( {
            hasError: false,
            errorId: undefined,
            error: undefined,
            errorInfo: undefined,
        } );
    };

    render(): ReactNode
    {
        const { hasError, errorId } = this.state;
        const { fallback, children } = this.props;

        if( hasError )
        {
            if( fallback ) return fallback;

            return (
                <FullPageError onRetry={this.handleRetry} errorId={errorId} />
            );
        }

        return children;
    }
}

// Page-level wrapper
export function PageErrorBoundary( { children }: { children: ReactNode } )
{
    return <ErrorBoundary level="page">{children}</ErrorBoundary>;
}

// Component-level wrapper
export function ComponentErrorBoundary( {
    children,
    fallback,
}: {
    children: ReactNode;
    fallback?: ReactNode;
} )
{
    return <ErrorBoundary level="component" fallback={fallback}>{children}</ErrorBoundary>;
}

// Global error reporter interface
declare global
{
    interface Window
    {
        errorReporting?: {
            captureException: ( error: Error, context?: Record<string, unknown> ) => void;
        };
    }
}
