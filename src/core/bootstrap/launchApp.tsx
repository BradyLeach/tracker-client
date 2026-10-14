import React from 'react';
import ReactDOM from 'react-dom/client';
import { bootstrap } from '@/core/bootstrap';
import { renderApp } from '@/renderApp';
import { FullPageError } from '@/components/pages/FullPageError';

export async function launchApp()
{
    try
    {
        await bootstrap();
        renderApp();
    }
    catch ( error )
    {
        console.error( 'Fatal app launch error', error );

        ReactDOM.createRoot( document.getElementById( 'root' )! ).render(
            <React.StrictMode>
                <FullPageError onRetry={() => window.location.reload()} />
            </React.StrictMode>
        );
    }
}