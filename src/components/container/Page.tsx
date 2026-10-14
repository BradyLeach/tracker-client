import { type ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';

interface PageProps
{
    children: ReactNode;
    title?: string;
    description?: string;
}

export function Page( { children, title, description }: PageProps )
{
    return (
        <>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
            </Helmet>
            {children}
        </>
    );
}

export default Page;
